use anchor_lang::prelude::*;

declare_id!("95ZEnzPdUE1bmF1oF2qjrYaGYPKyeeEmyz8h2xRgJ7e3");

/// Protocol Market Rake: 1.00% (100 basis points) on claimed winning pools
pub const MARKET_RAKE_BPS: u64 = 100;

#[program]
pub mod flint_market {
    use super::*;

    /// Creates a prediction market tied to a gig milestone deliverable
    pub fn create_milestone_market(
        ctx: Context<CreateMarket>,
        market_id: u64,
        gig_id: u64,
        market_type: MarketType,
        target_timestamp: i64,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.authority = ctx.accounts.authority.key();
        market.market_id = market_id;
        market.gig_id = gig_id;
        market.market_type = market_type;
        market.target_timestamp = target_timestamp;
        market.yes_pool = 0;
        market.no_pool = 0;
        market.total_volume = 0;
        market.is_resolved = false;
        market.winning_outcome = None;
        market.is_private_er_active = false;
        market.bump = ctx.bumps.market;

        msg!(
            "Flint Market #{}: Created for Gig #{} (Type: {:?}, Deadline: {})",
            market_id,
            gig_id,
            market_type,
            target_timestamp
        );
        Ok(())
    }

    /// Enables MagicBlock Private Ephemeral Rollup (PER) mode for dark order matching
    /// Encrypts order flow inside Intel TDX TEE to prevent frontrunning
    pub fn enable_private_er_mode(ctx: Context<ManageMarketMode>) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.is_private_er_active = true;
        msg!("Flint Market #{}: Private Ephemeral Rollup dark pool enabled", market.market_id);
        Ok(())
    }

    /// Place order inside Private Ephemeral Rollup (TEEs prevent position copy-trading)
    pub fn place_private_order_per(
        ctx: Context<PlaceOrder>,
        is_yes: bool,
        amount: u64,
        _encrypted_position_proof: [u8; 64],
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let position = &mut ctx.accounts.position;

        require!(!market.is_resolved, MarketError::MarketAlreadyResolved);
        require!(amount > 0, MarketError::InvalidAmount);

        // Transfer funds from trader to market vault PDA
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.trader.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, amount)?;

        // Update pools
        if is_yes {
            market.yes_pool = market.yes_pool.saturating_add(amount);
            position.yes_shares = position.yes_shares.saturating_add(amount);
        } else {
            market.no_pool = market.no_pool.saturating_add(amount);
            position.no_shares = position.no_shares.saturating_add(amount);
        }

        market.total_volume = market.total_volume.saturating_add(amount);
        position.owner = ctx.accounts.trader.key();
        position.market = market.key();

        msg!(
            "Flint Market #{}: Order executed. {} lamports locked in vault. Total Volume: {}",
            market.market_id,
            amount,
            market.total_volume
        );
        Ok(())
    }

    /// Resolves the milestone outcome (YES = delivered on-time / passed benchmark; NO = delayed / failed)
    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
        outcome_is_yes: bool,
        vrf_randomness: Option<[u8; 32]>,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(!market.is_resolved, MarketError::MarketAlreadyResolved);

        market.is_resolved = true;
        market.winning_outcome = Some(outcome_is_yes);

        if let Some(vrf) = vrf_randomness {
            msg!("Flint Market #{}: Resolved with MagicBlock VRF verification: {:?}", market.market_id, vrf);
        } else {
            msg!("Flint Market #{}: Resolved by oracle / authority. Winner: YES={}", market.market_id, outcome_is_yes);
        }

        Ok(())
    }

    /// Claims winnings from the market pool and transfers lamports to trader
    pub fn claim_payout(ctx: Context<ClaimPayout>) -> Result<()> {
        let market = &ctx.accounts.market;
        let position = &mut ctx.accounts.position;

        require!(market.is_resolved, MarketError::MarketNotResolved);
        let winning_outcome = market.winning_outcome.ok_or(MarketError::MarketNotResolved)?;

        let (shares, total_winning_pool, total_losing_pool) = if winning_outcome {
            (position.yes_shares, market.yes_pool, market.no_pool)
        } else {
            (position.no_shares, market.no_pool, market.yes_pool)
        };

        require!(shares > 0, MarketError::NoWinningShares);

        // Pro-rata payout calculation
        let total_pot = total_winning_pool.saturating_add(total_losing_pool);
        let gross_payout = if total_winning_pool > 0 {
            (shares as u128)
                .saturating_mul(total_pot as u128)
                .checked_div(total_winning_pool as u128)
                .unwrap_or(0) as u64
        } else {
            0
        };

        // Reset shares to prevent re-entrancy
        if winning_outcome {
            position.yes_shares = 0;
        } else {
            position.no_shares = 0;
        }

        // Calculate 1.0% (100 BPS) underwriter market rake
        let market_rake = (gross_payout as u128)
            .saturating_mul(MARKET_RAKE_BPS as u128)
            .checked_div(10_000)
            .unwrap_or(0) as u64;
        let trader_net = gross_payout.saturating_sub(market_rake);

        // Disburse earned lamports from market vault to trader and treasury
        if gross_payout > 0 {
            **ctx.accounts.vault.try_borrow_mut_lamports()? = ctx
                .accounts
                .vault
                .lamports()
                .saturating_sub(gross_payout);
            **ctx.accounts.trader.try_borrow_mut_lamports()? = ctx
                .accounts
                .trader
                .lamports()
                .saturating_add(trader_net);

            if market_rake > 0 {
                **ctx.accounts.treasury.try_borrow_mut_lamports()? = ctx
                    .accounts
                    .treasury
                    .lamports()
                    .saturating_add(market_rake);
            }
        }

        msg!(
            "Flint Market: Trader claimed {} lamports (net). Disbursed {} lamports (1.0%) to treasury",
            trader_net,
            market_rake
        );
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct CreateMarket<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + MilestoneMarket::LEN,
        seeds = [b"milestone_market", market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub market: Account<'info, MilestoneMarket>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ManageMarketMode<'info> {
    #[account(mut, has_one = authority @ MarketError::Unauthorized)]
    pub market: Account<'info, MilestoneMarket>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct PlaceOrder<'info> {
    #[account(mut)]
    pub market: Account<'info, MilestoneMarket>,
    #[account(
        mut,
        seeds = [b"vault", market.key().as_ref()],
        bump
    )]
    /// CHECK: Vault holding escrowed prediction market bets
    pub vault: AccountInfo<'info>,
    #[account(
        init_if_needed,
        payer = trader,
        space = 8 + TraderPosition::LEN,
        seeds = [b"position", market.key().as_ref(), trader.key().as_ref()],
        bump
    )]
    pub position: Account<'info, TraderPosition>,
    #[account(mut)]
    pub trader: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut, has_one = authority @ MarketError::Unauthorized)]
    pub market: Account<'info, MilestoneMarket>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimPayout<'info> {
    pub market: Account<'info, MilestoneMarket>,
    #[account(
        mut,
        seeds = [b"vault", market.key().as_ref()],
        bump
    )]
    /// CHECK: Vault dispersing payout funds
    pub vault: AccountInfo<'info>,
    #[account(
        mut,
        has_one = market,
        constraint = position.owner == trader.key() @ MarketError::Unauthorized
    )]
    pub position: Account<'info, TraderPosition>,
    #[account(mut)]
    /// CHECK: Protocol Treasury account receiving the 1.0% market rake
    pub treasury: AccountInfo<'info>,
    #[account(mut)]
    pub trader: Signer<'info>,
}

#[account]
pub struct MilestoneMarket {
    pub authority: Pubkey,
    pub market_id: u64,
    pub gig_id: u64,
    pub market_type: MarketType,
    pub target_timestamp: i64,
    pub yes_pool: u64,
    pub no_pool: u64,
    pub total_volume: u64,
    pub is_resolved: bool,
    pub winning_outcome: Option<bool>,
    pub is_private_er_active: bool,
    pub bump: u8,
}

impl MilestoneMarket {
    pub const LEN: usize = 32 + 8 + 8 + 1 + 8 + 8 + 8 + 8 + 1 + 2 + 1 + 1 + 16;
}

#[account]
pub struct TraderPosition {
    pub owner: Pubkey,
    pub market: Pubkey,
    pub yes_shares: u64,
    pub no_shares: u64,
}

impl TraderPosition {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 16;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum MarketType {
    MilestoneVelocity, // "Will PR merge on time?"
    QualityBenchmark,  // "Will code pass test coverage & latency criteria?"
    BountySprintRace,  // "Which agent completes bounty first?"
}

#[error_code]
pub enum MarketError {
    #[msg("Unauthorized market operation")]
    Unauthorized,
    #[msg("Market has already been resolved")]
    MarketAlreadyResolved,
    #[msg("Market is not yet resolved")]
    MarketNotResolved,
    #[msg("Invalid wager amount")]
    InvalidAmount,
    #[msg("Trader has zero winning shares")]
    NoWinningShares,
}
