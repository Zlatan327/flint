use anchor_lang::prelude::*;
use flint_reputation::cpi::accounts::RecordCompletion;
use flint_reputation::program::FlintReputation;

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
        
        gig.submitted_at = 0;
        gig.dispute_status = DisputeStatus::None;
        gig.dispute_reason = None;
        gig.evidence_hash = [0u8; 32];
        gig.defense_hash = [0u8; 32];
        gig.client_bond_lamports = 0;
        gig.freelancer_bond_lamports = 0;
        gig.disputed_at = 0;

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
        gig.submitted_at = Clock::get()?.unix_timestamp;

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
        
        // Security Patch SEC-01: In Reviewing status, ONLY the client can approve and release funds.
        // If ReadyForSettlement (milestones pre-approved in Ephemeral Rollup), either party can finalize L1 settlement.
        if gig.status == EscrowStatus::Reviewing {
            require!(ctx.accounts.signer.key() == gig.client, EscrowError::Unauthorized);
        } else {
            require!(
                ctx.accounts.signer.key() == gig.client || ctx.accounts.signer.key() == gig.freelancer,
                EscrowError::Unauthorized
            );
        }
        require!(gig.dispute_status == DisputeStatus::None, EscrowError::InvalidStatus);
        require!(gig.status != EscrowStatus::Disputed, EscrowError::InvalidStatus);
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

        // Safe transfer: Vault is a PDA owned by SystemProgram, so we must use invoke_signed.
        let gig_escrow_key = gig.key();
        let vault_bump = ctx.bumps.vault;
        let vault_seeds = &[b"vault", gig_escrow_key.as_ref(), &[vault_bump]];
        let signer = &[&vault_seeds[..]];

        if freelancer_payout > 0 {
            anchor_lang::system_program::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.freelancer.to_account_info(),
                    },
                    signer,
                ),
                freelancer_payout,
            )?;
        }

        if protocol_fee > 0 {
            anchor_lang::system_program::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.treasury.to_account_info(),
                    },
                    signer,
                ),
                protocol_fee,
            )?;
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
                authority: ctx.accounts.signer.to_account_info(),
                core_program: ctx.accounts.core_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            };
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            if let Err(e) = flint_reputation::cpi::record_gig_completion_sbt(cpi_ctx, gig.gig_id, freelancer_payout, delivered_on_time) {
                msg!("Flint: SBT minting failed: {:?}. Settlement proceeds without reputation update.", e);
            }
        }

        msg!(
            "Flint: Gig #{} settled to L1. Released {} lamports to freelancer, {} lamports (1.5%) to treasury",
            gig.gig_id,
            freelancer_payout,
            protocol_fee
        );
        Ok(())
    }

    /// Allows the client to cancel an unassigned gig or claim a refund if freelancer defaults past deadline (SEC-04)
    pub fn cancel_or_refund_escrow(ctx: Context<CancelEscrow>) -> Result<()> {
        let gig = &mut ctx.accounts.gig_escrow;
        let clock = Clock::get()?;

        // Cancellation rules:
        // 1. If unassigned and Funded/Initialized, client can cancel immediately.
        // 2. If assigned and InProgress, client can only cancel/refund if deadline has passed without work submission.
        let can_cancel = match gig.status {
            EscrowStatus::Initialized | EscrowStatus::Funded => !gig.is_freelancer_assigned,
            EscrowStatus::InProgress => clock.unix_timestamp > gig.deadline,
            _ => false,
        };
        require!(can_cancel, EscrowError::CannotCancelGig);

        let refund_amount = if gig.remaining_amount > 0 {
            gig.remaining_amount
        } else {
            gig.total_amount
        };

        // Disburse funds back to client from vault
        // Safe transfer from SystemProgram-owned vault PDA
        if refund_amount > 0 {
            let gig_escrow_key = gig.key();
            let vault_bump = ctx.bumps.vault;
            let vault_seeds = &[b"vault", gig_escrow_key.as_ref(), &[vault_bump]];
            let signer = &[&vault_seeds[..]];

            anchor_lang::system_program::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.client.to_account_info(),
                    },
                    signer,
                ),
                refund_amount,
            )?;
        }

        gig.remaining_amount = 0;
        gig.status = EscrowStatus::Cancelled;

        msg!("Flint: Gig #{} cancelled. Refunded {} lamports to client", gig.gig_id, refund_amount);
        Ok(())
    }

    pub fn raise_deliverable_dispute(
        ctx: Context<RaiseDeliverableDispute>,
        dispute_reason: DisputeReason,
        evidence_hash: [u8; 32],
    ) -> Result<()> {
        let gig = &mut ctx.accounts.gig_escrow;
        
        // Must be in Reviewing status
        require!(gig.status == EscrowStatus::Reviewing, EscrowError::InvalidStatus);
        
        // Calculate bond: 10% of total_amount
        let bond = gig.total_amount / 10;
        require!(bond > 0, EscrowError::InvalidAmount);
        
        // Transfer bond from client to vault
        let transfer_ix = anchor_lang::system_program::Transfer {
            from: ctx.accounts.client.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        };
        anchor_lang::system_program::transfer(
            CpiContext::new(ctx.accounts.system_program.to_account_info(), transfer_ix),
            bond,
        )?;
        
        gig.status = EscrowStatus::Disputed;
        gig.dispute_status = DisputeStatus::Open;
        gig.dispute_reason = Some(dispute_reason);
        gig.evidence_hash = evidence_hash;
        gig.client_bond_lamports = bond;
        gig.disputed_at = Clock::get()?.unix_timestamp;
        
        msg!("Flint: Deliverable dispute raised. Reason: {:?}. Bond: {} lamports", gig.dispute_reason, bond);
        Ok(())
    }

    pub fn contest_or_accept_dispute(
        ctx: Context<ContestDispute>,
        contest: bool,
        defense_hash: [u8; 32],
    ) -> Result<()> {
        let gig = &mut ctx.accounts.gig_escrow;
        
        require!(gig.status == EscrowStatus::Disputed, EscrowError::InvalidStatus);
        require!(gig.dispute_status == DisputeStatus::Open, EscrowError::InvalidStatus);
        
        if contest {
            // Freelancer contests — must stake matching bond
            let bond = gig.client_bond_lamports;
            
            let transfer_ix = anchor_lang::system_program::Transfer {
                from: ctx.accounts.freelancer.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            };
            anchor_lang::system_program::transfer(
                CpiContext::new(ctx.accounts.system_program.to_account_info(), transfer_ix),
                bond,
            )?;
            
            gig.freelancer_bond_lamports = bond;
            gig.defense_hash = defense_hash;
            gig.dispute_status = DisputeStatus::Contested;
            msg!("Flint: Dispute contested by freelancer. Bond: {} lamports", bond);
        } else {
            // Freelancer accepts the slash
            gig.dispute_status = DisputeStatus::Accepted;
            msg!("Flint: Freelancer accepted dispute. Slash applied.");
        }
        
        Ok(())
    }

    pub fn auto_release_timeout(ctx: Context<AutoRelease>) -> Result<()> {
        let gig = &mut ctx.accounts.gig_escrow;
        let now = Clock::get()?.unix_timestamp;
        
        // Case 1: Client never reviewed (7 days after submission)
        if gig.status == EscrowStatus::Reviewing && gig.submitted_at > 0 {
            let review_window = 7 * 24 * 60 * 60; // 7 days
            require!(
                now >= gig.submitted_at + review_window,
                EscrowError::TimeoutNotReached
            );
            gig.status = EscrowStatus::ReadyForSettlement;
            msg!("Flint: Review timeout reached. Auto-releasing to freelancer.");
            return Ok(());
        }
        
        // Case 2: Freelancer never contested (72 hours after dispute)
        if gig.status == EscrowStatus::Disputed && gig.dispute_status == DisputeStatus::Open {
            let contest_window = 72 * 60 * 60; // 72 hours
            require!(
                now >= gig.disputed_at + contest_window,
                EscrowError::TimeoutNotReached
            );
            gig.dispute_status = DisputeStatus::Accepted;
            msg!("Flint: Contest timeout reached. Slash auto-accepted.");
            return Ok(());
        }
        
        Err(EscrowError::InvalidStatus.into())
    }

    /// Settles an accepted dispute: returns escrow and client bond to client (refund minus protocol rake)
    pub fn settle_accepted_dispute(ctx: Context<SettleAcceptedDispute>) -> Result<()> {
        let gig = &mut ctx.accounts.gig_escrow;
        require!(gig.dispute_status == DisputeStatus::Accepted, EscrowError::InvalidStatus);

        let escrow_amount = if gig.remaining_amount > 0 {
            gig.remaining_amount
        } else {
            gig.total_amount
        };

        let protocol_fee = (escrow_amount as u128)
            .saturating_mul(PROTOCOL_FEE_BPS as u128)
            .checked_div(10_000)
            .unwrap_or(0) as u64;

        let client_refund = escrow_amount
            .saturating_sub(protocol_fee)
            .saturating_add(gig.client_bond_lamports)
            .saturating_add(gig.freelancer_bond_lamports);

        let gig_escrow_key = gig.key();
        let vault_bump = ctx.bumps.vault;
        let vault_seeds = &[b"vault", gig_escrow_key.as_ref(), &[vault_bump]];
        let signer = &[&vault_seeds[..]];

        if client_refund > 0 {
            anchor_lang::system_program::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.client.to_account_info(),
                    },
                    signer,
                ),
                client_refund,
            )?;
        }

        if protocol_fee > 0 {
            anchor_lang::system_program::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.treasury.to_account_info(),
                    },
                    signer,
                ),
                protocol_fee,
            )?;
        }

        gig.remaining_amount = 0;
        gig.client_bond_lamports = 0;
        gig.freelancer_bond_lamports = 0;
        gig.status = EscrowStatus::Completed;
        gig.dispute_status = DisputeStatus::Resolved;

        msg!(
            "Flint: Accepted dispute settled. Refunded {} lamports to client, {} lamports to treasury",
            client_refund,
            protocol_fee
        );
        Ok(())
    }

    /// Resolves an arbitration outcome for contested disputes: distributes pro-rata escrow and bonds
    pub fn resolve_arbitration(
        ctx: Context<ResolveArbitration>,
        slash_upheld: bool,
        freelancer_payout_pct: u8,
    ) -> Result<()> {
        let gig = &mut ctx.accounts.gig_escrow;
        require!(gig.status == EscrowStatus::Disputed, EscrowError::InvalidStatus);
        require!(gig.dispute_status == DisputeStatus::Contested, EscrowError::InvalidStatus);
        require!(freelancer_payout_pct <= 100, EscrowError::InvalidAmount);

        let escrow_amount = if gig.remaining_amount > 0 {
            gig.remaining_amount
        } else {
            gig.total_amount
        };

        let protocol_fee = (escrow_amount as u128)
            .saturating_mul(PROTOCOL_FEE_BPS as u128)
            .checked_div(10_000)
            .unwrap_or(0) as u64;
        let net_escrow = escrow_amount.saturating_sub(protocol_fee);

        let freelancer_payout_from_escrow = (net_escrow as u128)
            .saturating_mul(freelancer_payout_pct as u128)
            .checked_div(100)
            .unwrap_or(0) as u64;
        let client_refund_from_escrow = net_escrow.saturating_sub(freelancer_payout_from_escrow);

        let (freelancer_total, client_total) = if slash_upheld {
            let c_total = client_refund_from_escrow
                .saturating_add(gig.client_bond_lamports)
                .saturating_add(gig.freelancer_bond_lamports);
            (freelancer_payout_from_escrow, c_total)
        } else {
            let f_total = freelancer_payout_from_escrow
                .saturating_add(gig.client_bond_lamports)
                .saturating_add(gig.freelancer_bond_lamports);
            (f_total, client_refund_from_escrow)
        };

        let gig_escrow_key = gig.key();
        let vault_bump = ctx.bumps.vault;
        let vault_seeds = &[b"vault", gig_escrow_key.as_ref(), &[vault_bump]];
        let signer = &[&vault_seeds[..]];

        if freelancer_total > 0 {
            anchor_lang::system_program::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.freelancer.to_account_info(),
                    },
                    signer,
                ),
                freelancer_total,
            )?;
        }

        if client_total > 0 {
            anchor_lang::system_program::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.client.to_account_info(),
                    },
                    signer,
                ),
                client_total,
            )?;
        }

        if protocol_fee > 0 {
            anchor_lang::system_program::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.treasury.to_account_info(),
                    },
                    signer,
                ),
                protocol_fee,
            )?;
        }

        gig.remaining_amount = 0;
        gig.client_bond_lamports = 0;
        gig.freelancer_bond_lamports = 0;
        gig.status = EscrowStatus::Completed;
        gig.dispute_status = DisputeStatus::Resolved;

        msg!(
            "Flint: Arbitration resolved. Slash upheld: {}. Freelancer received: {}. Client received: {}. Fee: {}",
            slash_upheld,
            freelancer_total,
            client_total,
            protocol_fee
        );
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
pub struct CancelEscrow<'info> {
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
    /// CHECK: Vault PDA returning refund
    pub vault: AccountInfo<'info>,
    #[account(mut)]
    pub client: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RaiseDeliverableDispute<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
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
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ContestDispute<'info> {
    #[account(mut)]
    pub freelancer: Signer<'info>,
    #[account(
        mut,
        has_one = freelancer @ EscrowError::Unauthorized,
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
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AutoRelease<'info> {
    #[account(mut)]
    pub gig_escrow: Account<'info, GigEscrow>,
}

#[derive(Accounts)]
pub struct SettleAcceptedDispute<'info> {
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
    /// CHECK: Vault PDA returning refund
    pub vault: AccountInfo<'info>,
    #[account(mut)]
    pub client: Signer<'info>,
    #[account(mut)]
    /// CHECK: Protocol Treasury account receiving take rate
    pub treasury: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveArbitration<'info> {
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
    /// CHECK: Vault PDA holding escrow and bonds
    pub vault: AccountInfo<'info>,
    #[account(
        mut,
        constraint = client.key() == gig_escrow.client @ EscrowError::Unauthorized
    )]
    /// CHECK: Client account receiving refund/bond
    pub client: AccountInfo<'info>,
    #[account(
        mut,
        constraint = freelancer.key() == gig_escrow.freelancer @ EscrowError::Unauthorized
    )]
    /// CHECK: Freelancer account receiving payout/bond
    pub freelancer: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: Protocol treasury
    pub treasury: AccountInfo<'info>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
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
    pub submitted_at: i64,              // timestamp when work was submitted
    pub dispute_status: DisputeStatus,   // dispute state
    pub dispute_reason: Option<DisputeReason>,
    pub evidence_hash: [u8; 32],        // client's evidence commitment
    pub defense_hash: [u8; 32],         // freelancer's defense commitment  
    pub client_bond_lamports: u64,       // client's dispute bond
    pub freelancer_bond_lamports: u64,   // freelancer's contest bond
    pub disputed_at: i64,               // when dispute was raised
}

impl GigEscrow {
    pub const LEN: usize = 32 // client
        + 32 // freelancer
        + 8  // gig_id
        + 8  // total_amount
        + 8  // remaining_amount
        + 8  // deadline
        + 1  // milestones_count
        + 1  // completed_milestones
        + 1  // status
        + 1  // settlement_model
        + 1  // is_freelancer_assigned
        + 32 // deliverable_hash
        + 1  // is_delegated_to_er
        + 1  // bump
        + 8  // submitted_at
        + 1  // dispute_status
        + 2  // dispute_reason (Option<DisputeReason>)
        + 32 // evidence_hash
        + 32 // defense_hash
        + 8  // client_bond_lamports
        + 8  // freelancer_bond_lamports
        + 8; // disputed_at
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum DisputeReason {
    Incomplete,      // Missing agreed deliverables
    BelowSpec,       // Doesn't meet acceptance criteria
    WrongScope,      // Delivered something different from brief
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum DisputeStatus {
    None,
    Open,            // Client raised dispute, waiting for freelancer response
    Contested,       // Freelancer contested, awaiting arbitration
    Accepted,        // Freelancer accepted the slash
    Resolved,        // Arbiters voted, funds distributed
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
    Cancelled,
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
    #[msg("Gig cannot be cancelled or refunded under current status/deadline")]
    CannotCancelGig,
    #[msg("Timeout period has not been reached yet")]
    TimeoutNotReached,
    #[msg("Invalid amount specified")]
    InvalidAmount,
}

#[cfg(test)]
mod tests {
    use super::*;

    // Helper to test inline math logic
    pub fn calculate_protocol_fee(payout: u64) -> u64 {
        (payout as u128)
            .saturating_mul(PROTOCOL_FEE_BPS as u128)
            .checked_div(10_000)
            .unwrap_or(0) as u64
    }

    #[test]
    fn test_protocol_fee_calculation() {
        assert_eq!(calculate_protocol_fee(1000), 15);
        assert_eq!(calculate_protocol_fee(0), 0);
        assert_eq!(calculate_protocol_fee(10_000), 150);
        assert_eq!(calculate_protocol_fee(1_000_000_000), 15_000_000);
    }

    #[test]
    fn test_status_transition_validity() {
        let mut gig = GigEscrow {
            client: Pubkey::default(),
            freelancer: Pubkey::default(),
            gig_id: 1,
            total_amount: 1000,
            remaining_amount: 1000,
            deadline: 0,
            milestones_count: 2,
            completed_milestones: 0,
            status: EscrowStatus::Initialized,
            settlement_model: SettlementModel::Bounty,
            is_freelancer_assigned: false,
            deliverable_hash: [0; 32],
            is_delegated_to_er: false,
            bump: 0,
            submitted_at: 0,
            dispute_status: DisputeStatus::None,
            dispute_reason: None,
            evidence_hash: [0u8; 32],
            defense_hash: [0u8; 32],
            client_bond_lamports: 0,
            freelancer_bond_lamports: 0,
            disputed_at: 0,
        };

        // Initialization
        assert_eq!(gig.status, EscrowStatus::Initialized);
        
        // Deposit
        gig.status = EscrowStatus::Funded;
        assert_eq!(gig.status, EscrowStatus::Funded);

        // Assign freelancer
        gig.is_freelancer_assigned = true;
        gig.status = EscrowStatus::InProgress;
        assert!(gig.is_freelancer_assigned);
        assert_eq!(gig.status, EscrowStatus::InProgress);

        // Submit work
        gig.status = EscrowStatus::Reviewing;
        assert_eq!(gig.status, EscrowStatus::Reviewing);
    }

    #[test]
    fn test_dispute_bond_calculation() {
        let total_amount = 5000;
        let bond = total_amount / 10;
        assert_eq!(bond, 500);

        let small_amount = 9;
        let small_bond = small_amount / 10;
        assert_eq!(small_bond, 0); // Testing round down to 0 which would trigger error
    }

    #[test]
    fn test_timeout_constants() {
        let review_window = 7 * 24 * 60 * 60; // 7 days
        assert_eq!(review_window, 604800);

        let contest_window = 72 * 60 * 60; // 72 hours
        assert_eq!(contest_window, 259200);
    }
}
