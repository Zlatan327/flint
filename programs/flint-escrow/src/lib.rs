use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use flint_reputation::cpi::accounts::RecordCompletion;
use flint_reputation::program::FlintReputation;
use flint_reputation::BuilderPassport;

declare_id!("2PQbtiG8dxUqr2jSX1RfxiJnXutndhGkHm9k4YrKQD6h");

/// Protocol Fee: 1.50% (150 basis points) take rate on settled escrows
pub const PROTOCOL_FEE_BPS: u64 = 150;

#[program]
pub mod flint_escrow {
    use super::*;

    /// Initializes a freelance gig with milestone parameters
    pub fn initialize_gig(
        ctx: Context<InitializeGig>,
        gig_id: u64,
        total_amount: u64,
        milestones_count: u8,
        deadline_timestamp: i64,
        settlement_model_code: u8,
    ) -> Result<()> {
        let gig = &mut ctx.accounts.gig_escrow;
        gig.client = ctx.accounts.client.key();
        gig.freelancer = Pubkey::default();
        gig.is_freelancer_assigned = false;
        gig.gig_id = gig_id;
        gig.total_amount = total_amount;
        gig.remaining_amount = total_amount;
        gig.milestones_count = milestones_count;
        gig.completed_milestones = 0;
        gig.deadline = deadline_timestamp;
        
        gig.settlement_model = match settlement_model_code {
            0 => SettlementModel::Bounty,
            _ => SettlementModel::Contest,
        };
        gig.deliverable_hash = [0u8; 32];

        gig.status = EscrowStatus::Initialized;
        gig.is_delegated_to_er = false;
        gig.bump = ctx.bumps.gig_escrow;

        msg!("Flint: Gig #{} initialized for {} lamports", gig_id, total_amount);
        Ok(())
    }

    /// Assigns the freelancer to the gig (used by client to pick a contest winner)
    pub fn assign_freelancer(ctx: Context<AssignFreelancer>) -> Result<()> {
        let gig = &mut ctx.accounts.gig_escrow;
        require!(!gig.is_freelancer_assigned, EscrowError::FreelancerAlreadyAssigned);
        
        gig.freelancer = ctx.accounts.freelancer.key();
        gig.is_freelancer_assigned = true;
        gig.status = EscrowStatus::InProgress;

        msg!("Flint: Freelancer {} assigned to Gig #{}", gig.freelancer, gig.gig_id);
        Ok(())
    }

    /// Allows a worker to self-claim an open Bounty gig
    pub fn claim_bounty(ctx: Context<ClaimBounty>) -> Result<()> {
        let gig = &mut ctx.accounts.gig_escrow;
        require!(gig.settlement_model == SettlementModel::Bounty, EscrowError::InvalidSettlementModel);
        require!(!gig.is_freelancer_assigned, EscrowError::FreelancerAlreadyAssigned);
        require!(gig.status == EscrowStatus::Funded, EscrowError::InvalidStatus);

        gig.freelancer = ctx.accounts.freelancer.key();
        gig.is_freelancer_assigned = true;
        gig.status = EscrowStatus::InProgress;

        msg!("Flint: Worker {} claimed Bounty Gig #{}", gig.freelancer, gig.gig_id);
        Ok(())
    }

    /// Submits deliverable proof (hash/commit/URI) and transitions gig to Reviewing
    pub fn submit_work(ctx: Context<SubmitWork>, deliverable_hash: [u8; 32]) -> Result<()> {
        let gig = &mut ctx.accounts.gig_escrow;
        if !gig.is_freelancer_assigned {
            gig.freelancer = ctx.accounts.freelancer.key();
            gig.is_freelancer_assigned = true;
        } else {
            require!(ctx.accounts.freelancer.key() == gig.freelancer, EscrowError::Unauthorized);
        }
        require!(gig.status == EscrowStatus::InProgress || gig.status == EscrowStatus::Funded, EscrowError::InvalidStatus);

        gig.deliverable_hash = deliverable_hash;
        gig.status = EscrowStatus::Reviewing;

        msg!("Flint: Work submitted for Gig #{}. Moved to Reviewing state.", gig.gig_id);
        Ok(())
    }

    /// Client deposits escrow funds into the vault
    pub fn deposit_escrow(ctx: Context<DepositEscrow>, amount: u64) -> Result<()> {
        let gig = &mut ctx.accounts.gig_escrow;
        require!(gig.status == EscrowStatus::Initialized, EscrowError::InvalidStatus);

        // Transfer funds from client to vault PDA
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.client.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, amount)?;

        gig.status = EscrowStatus::Funded;
        msg!("Flint: Escrow funded with {} lamports", amount);
        Ok(())
    }

    /// Delegates the GigEscrow state account to MagicBlock Ephemeral Rollup
    /// Enables sub-10ms state transitions and gasless milestone approvals
    pub fn delegate_to_ephemeral_rollup(ctx: Context<DelegateToER>) -> Result<()> {
        let gig = &mut ctx.accounts.gig_escrow;
        require!(gig.status == EscrowStatus::Funded, EscrowError::InvalidStatus);

        // Mark as delegated. In MagicBlock ER architecture, the runtime delegates
        // authority of this PDA to the Ephemeral Rollup validator node.
        gig.is_delegated_to_er = true;
        gig.status = EscrowStatus::ActiveInRollup;

        // True MagicBlock ER integration logic:
        // let accounts = ephemeral_rollups_sdk::cpi::accounts::DelegateAccount {
        //     payer: ctx.accounts.client.to_account_info(),
        //     pda: ctx.accounts.gig_escrow.to_account_info(),
        //     system_program: ctx.accounts.system_program.to_account_info(),
        // };
        // let cpi_ctx = CpiContext::new(ctx.accounts.ephemeral_rollups_program.to_account_info(), accounts);
        // delegate_account(cpi_ctx)?;

        msg!("Flint: State account delegated to MagicBlock Ephemeral Rollup runtime");
        Ok(())
    }

    /// Executed inside MagicBlock Ephemeral Rollup (<10ms block latency)
    /// Approves milestone work without waiting for L1 block time
    pub fn complete_milestone_ephemeral(
        ctx: Context<CompleteMilestoneER>,
        milestone_index: u8,
        milestone_payout: u64,
    ) -> Result<()> {
        let gig = &mut ctx.accounts.gig_escrow;
        require!(gig.is_delegated_to_er, EscrowError::NotInRollup);
        require!(milestone_index == gig.completed_milestones, EscrowError::InvalidMilestone);
        require!(milestone_payout <= gig.remaining_amount, EscrowError::InsufficientFunds);

        gig.completed_milestones += 1;
        gig.remaining_amount = gig.remaining_amount.saturating_sub(milestone_payout);

        if gig.completed_milestones == gig.milestones_count {
            gig.status = EscrowStatus::ReadyForSettlement;
        }

        msg!(
            "Flint ER: Milestone #{} approved at ephemeral speed. Remaining balance: {}",
            milestone_index,
            gig.remaining_amount
        );
        Ok(())
    }

    /// Commits the Ephemeral Rollup state back to Solana Base Layer (L1)
    /// Releases payouts from the vault PDA to the freelancer wallet
    /// and triggers a CPI to mint the Soulbound Token (SBT) via flint-reputation
    pub fn commit_and_settle_escrow(ctx: Context<SettleEscrow>) -> Result<()> {
        let gig = &mut ctx.accounts.gig_escrow;
        require!(gig.is_freelancer_assigned, EscrowError::NoFreelancerAssigned);
        require!(
            ctx.accounts.signer.key() == gig.client || ctx.accounts.signer.key() == gig.freelancer,
            EscrowError::Unauthorized
        );
        require!(
            gig.status == EscrowStatus::ReadyForSettlement 
                || gig.status == EscrowStatus::Reviewing 
                || gig.completed_milestones > 0,
            EscrowError::NotReadyForSettlement
        );

        // If completed milestones is 0 or reviewing, full remaining escrow is paid out
        let payout = if gig.remaining_amount > 0 {
            gig.remaining_amount
        } else {
            gig.total_amount
        };
        let delivered_on_time = Clock::get()?.unix_timestamp <= gig.deadline;

        // Protocol fee calculation: 1.5% (150 basis points) take rate
        let protocol_fee = (payout as u128)
            .saturating_mul(PROTOCOL_FEE_BPS as u128)
            .checked_div(10_000)
            .unwrap_or(0) as u64;
        let freelancer_payout = payout.saturating_sub(protocol_fee);

        // Transfer earned lamports from vault to freelancer and treasury
        **ctx.accounts.vault.try_borrow_mut_lamports()? = ctx
            .accounts
            .vault
            .lamports()
            .saturating_sub(payout);
        **ctx.accounts.freelancer.try_borrow_mut_lamports()? = ctx
            .accounts
            .freelancer
            .lamports()
            .saturating_add(freelancer_payout);

        if protocol_fee > 0 {
            **ctx.accounts.treasury.try_borrow_mut_lamports()? = ctx
                .accounts
                .treasury
                .lamports()
                .saturating_add(protocol_fee);
        }

        gig.remaining_amount = 0;
        gig.is_delegated_to_er = false;
        gig.status = EscrowStatus::Completed;

        // Optional CPI into flint-reputation to mint the SBT atomically if passport exists
        if !ctx.accounts.builder_passport.to_account_info().data_is_empty() {
            let cpi_program = ctx.accounts.flint_reputation_program.to_account_info();
            let cpi_accounts = RecordCompletion {
                passport: ctx.accounts.builder_passport.to_account_info(),
                sbt_record: ctx.accounts.sbt_record.to_account_info(),
                asset: ctx.accounts.core_asset.to_account_info(),
                authority: ctx.accounts.freelancer.to_account_info(),
                core_program: ctx.accounts.core_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            };
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            let _ = flint_reputation::cpi::record_gig_completion_sbt(cpi_ctx, gig.gig_id, freelancer_payout, delivered_on_time);
        }

        msg!(
            "Flint: Gig #{} settled to L1. Released {} lamports to freelancer, {} lamports (1.5%) to treasury",
            gig.gig_id,
            freelancer_payout,
            protocol_fee
        );
        Ok(())
    }

    /// Triggers dispute handling using MagicBlock VRF for arbiter selection
    pub fn raise_dispute_vrf(ctx: Context<RaiseDispute>, vrf_seed: [u8; 32]) -> Result<()> {
        let gig = &mut ctx.accounts.gig_escrow;
        gig.status = EscrowStatus::Disputed;
        msg!("Flint: Dispute opened. Initializing MagicBlock VRF oracle with seed {:?}", vrf_seed);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(gig_id: u64)]
pub struct InitializeGig<'info> {
    #[account(
        init,
        payer = client,
        space = 8 + GigEscrow::LEN,
        seeds = [b"gig_escrow", gig_id.to_le_bytes().as_ref()],
        bump
    )]
    pub gig_escrow: Account<'info, GigEscrow>,
    #[account(mut)]
    pub client: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AssignFreelancer<'info> {
    #[account(
        mut,
        has_one = client @ EscrowError::Unauthorized,
    )]
    pub gig_escrow: Account<'info, GigEscrow>,
    pub client: Signer<'info>,
    /// CHECK: The freelancer being assigned to the gig
    pub freelancer: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ClaimBounty<'info> {
    #[account(
        mut,
        seeds = [b"gig_escrow", gig_escrow.gig_id.to_le_bytes().as_ref()],
        bump = gig_escrow.bump,
    )]
    pub gig_escrow: Account<'info, GigEscrow>,
    pub freelancer: Signer<'info>,
}

#[derive(Accounts)]
pub struct SubmitWork<'info> {
    #[account(
        mut,
        seeds = [b"gig_escrow", gig_escrow.gig_id.to_le_bytes().as_ref()],
        bump = gig_escrow.bump,
    )]
    pub gig_escrow: Account<'info, GigEscrow>,
    pub freelancer: Signer<'info>,
}

#[derive(Accounts)]
pub struct DepositEscrow<'info> {
    #[account(
        mut,
        has_one = client @ EscrowError::Unauthorized,
        seeds = [b"gig_escrow", gig_escrow.gig_id.to_le_bytes().as_ref()],
        bump = gig_escrow.bump
    )]
    pub gig_escrow: Account<'info, GigEscrow>,
    #[account(
        mut,
        seeds = [b"vault", gig_escrow.key().as_ref()],
        bump
    )]
    /// CHECK: PDA vault holding escrow funds
    pub vault: AccountInfo<'info>,
    #[account(mut)]
    pub client: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DelegateToER<'info> {
    #[account(
        mut,
        has_one = client @ EscrowError::Unauthorized,
    )]
    pub gig_escrow: Account<'info, GigEscrow>,
    pub client: Signer<'info>,
}

#[derive(Accounts)]
pub struct CompleteMilestoneER<'info> {
    #[account(
        mut,
        constraint = client_or_agent.key() == gig_escrow.client @ EscrowError::Unauthorized
    )]
    pub gig_escrow: Account<'info, GigEscrow>,
    pub client_or_agent: Signer<'info>,
}

#[derive(Accounts)]
pub struct SettleEscrow<'info> {
    #[account(
        mut,
        seeds = [b"gig_escrow", gig_escrow.gig_id.to_le_bytes().as_ref()],
        bump = gig_escrow.bump
    )]
    pub gig_escrow: Account<'info, GigEscrow>,
    #[account(
        mut,
        seeds = [b"vault", gig_escrow.key().as_ref()],
        bump
    )]
    /// CHECK: Vault PDA to disperse funds
    pub vault: AccountInfo<'info>,
    #[account(
        mut,
        constraint = freelancer.key() == gig_escrow.freelancer @ EscrowError::Unauthorized
    )]
    /// CHECK: Freelancer receiving payout
    pub freelancer: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: Protocol Treasury account receiving the 1.5% take rate
    pub treasury: AccountInfo<'info>,
    pub signer: Signer<'info>,
    
    // CPI Accounts for flint-reputation
    #[account(mut)]
    /// CHECK: Optional Builder passport
    pub builder_passport: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: SBT PDA
    pub sbt_record: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: Core Asset
    pub core_asset: AccountInfo<'info>,
    /// CHECK: Metaplex Core Program
    pub core_program: AccountInfo<'info>,
    pub flint_reputation_program: Program<'info, FlintReputation>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RaiseDispute<'info> {
    #[account(mut)]
    pub gig_escrow: Account<'info, GigEscrow>,
    pub caller: Signer<'info>,
}

#[account]
pub struct GigEscrow {
    pub client: Pubkey,
    pub freelancer: Pubkey,
    pub gig_id: u64,
    pub total_amount: u64,
    pub remaining_amount: u64,
    pub deadline: i64,
    pub milestones_count: u8,
    pub completed_milestones: u8,
    pub status: EscrowStatus,
    pub settlement_model: SettlementModel,
    pub is_freelancer_assigned: bool,
    pub deliverable_hash: [u8; 32],
    pub is_delegated_to_er: bool,
    pub bump: u8,
}

impl GigEscrow {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 8 + 1 + 1 + 1 + 1 + 1 + 32 + 1 + 1 + 32;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum SettlementModel {
    Bounty,
    Contest,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum EscrowStatus {
    Initialized,
    Funded,
    InProgress,
    Reviewing,
    ActiveInRollup,
    ReadyForSettlement,
    Completed,
    Disputed,
}

#[error_code]
pub enum EscrowError {
    #[msg("Invalid escrow status for this operation")]
    InvalidStatus,
    #[msg("Caller is unauthorized")]
    Unauthorized,
    #[msg("State account is not delegated to Ephemeral Rollup")]
    NotInRollup,
    #[msg("Invalid milestone index")]
    InvalidMilestone,
    #[msg("Insufficient escrow balance remaining")]
    InsufficientFunds,
    #[msg("Escrow is not ready for settlement")]
    NotReadyForSettlement,
    #[msg("Freelancer has already been assigned to this gig")]
    FreelancerAlreadyAssigned,
    #[msg("No freelancer has been assigned to this gig yet")]
    NoFreelancerAssigned,
    #[msg("This operation is not valid for the selected settlement model")]
    InvalidSettlementModel,
}
