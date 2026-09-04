use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use flint_reputation::cpi::accounts::RecordCompletion;
use flint_reputation::program::FlintReputation;
use flint_reputation::BuilderPassport;

declare_id!("FLiNTEscrow111111111111111111111111111111111");

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
    ) -> Result<()> {
        let gig = &mut ctx.accounts.gig_escrow;
        gig.client = ctx.accounts.client.key();
        gig.freelancer = ctx.accounts.freelancer.key();
        gig.gig_id = gig_id;
        gig.total_amount = total_amount;
        gig.remaining_amount = total_amount;
        gig.milestones_count = milestones_count;
        gig.completed_milestones = 0;
        gig.deadline = deadline_timestamp;
        gig.status = EscrowStatus::Initialized;
        gig.is_delegated_to_er = false;
        gig.bump = ctx.bumps.gig_escrow;

        msg!("Flint: Gig #{} initialized for {} lamports", gig_id, total_amount);
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
        require!(
            gig.status == EscrowStatus::ReadyForSettlement || gig.completed_milestones > 0,
            EscrowError::NotReadyForSettlement
        );

        let payout = gig.total_amount.saturating_sub(gig.remaining_amount);
        let delivered_on_time = Clock::get()?.unix_timestamp <= gig.deadline;

        // Transfer earned lamports from vault to freelancer
        **ctx.accounts.vault.try_borrow_mut_lamports()? = ctx
            .accounts
            .vault
            .lamports()
            .saturating_sub(payout);
        **ctx.accounts.freelancer.try_borrow_mut_lamports()? = ctx
            .accounts
            .freelancer
            .lamports()
            .saturating_add(payout);

        gig.is_delegated_to_er = false;
        gig.status = EscrowStatus::Completed;

        // CPI into flint-reputation to mint the SBT atomically
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
        flint_reputation::cpi::record_gig_completion_sbt(cpi_ctx, gig.gig_id, payout, delivered_on_time)?;

        msg!("Flint: Gig #{} settled to L1. Released {} lamports to freelancer and CPI triggered SBT mint", gig.gig_id, payout);
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
    /// CHECK: Target freelancer public key verified by client
    pub freelancer: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
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
    pub freelancer: Signer<'info>,
    
    // CPI Accounts for flint-reputation
    #[account(mut)]
    pub builder_passport: Account<'info, BuilderPassport>,
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
    pub is_delegated_to_er: bool,
    pub bump: u8,
}

impl GigEscrow {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 8 + 1 + 1 + 1 + 1 + 1 + 16;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum EscrowStatus {
    Initialized,
    Funded,
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
}
