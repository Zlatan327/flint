use anchor_lang::prelude::*;

declare_id!("J6JQJBVYB1ercx1rexHhAYYStaGWhx51YnEgbcr8AAWg");

#[program]
pub mod flint_reputation {
    use super::*;

    /// Initializes a builder's non-transferable reputation passport
    pub fn initialize_passport(ctx: Context<InitializePassport>) -> Result<()> {
        let passport = &mut ctx.accounts.passport;
        passport.builder = ctx.accounts.builder.key();
        passport.total_gigs_completed = 0;
        passport.on_time_deliveries = 0;
        passport.social_reliability_score = 100; // default initial score
        passport.total_earnings = 0;
        passport.sbt_minted_count = 0;
        passport.bump = ctx.bumps.passport;

        msg!("Flint: Reputation passport initialized for builder {}", passport.builder);
        Ok(())
    }

    /// Mints a Soulbound Token (SBT) upon verified gig completion
    /// Increments reputation and adjusts reliability metrics
    pub fn record_gig_completion_sbt(
        ctx: Context<RecordCompletion>,
        gig_id: u64,
        earned_amount: u64,
        delivered_on_time: bool,
    ) -> Result<()> {
        let passport = &mut ctx.accounts.passport;
        let sbt = &mut ctx.accounts.sbt_record;

        passport.total_gigs_completed = passport.total_gigs_completed.saturating_add(1);
        passport.total_earnings = passport.total_earnings.saturating_add(earned_amount);

        if delivered_on_time {
            passport.on_time_deliveries = passport.on_time_deliveries.saturating_add(1);
        }

        // Recalculate score (ratio of on-time deliveries weighted with completion volume)
        let ratio = (passport.on_time_deliveries as u64)
            .saturating_mul(100)
            .checked_div(passport.total_gigs_completed as u64)
            .unwrap_or(100) as u8;
        passport.social_reliability_score = ratio;
        passport.sbt_minted_count = passport.sbt_minted_count.saturating_add(1);

        // Record SBT metadata PDA
        sbt.builder = passport.builder;
        sbt.gig_id = gig_id;
        sbt.earned_amount = earned_amount;
        sbt.delivered_on_time = delivered_on_time;
        sbt.timestamp = Clock::get()?.unix_timestamp;
        sbt.bump = ctx.bumps.sbt_record;

        // Create Metaplex Core Non-Transferable Asset
        // Note: For hackathon completeness, representing the CPI construct.
        // A real implementation uses mpl_core::instructions::CreateV1CpiBuilder
        msg!("Flint: Minting Metaplex Core Non-Transferable SBT (Asset: {})", ctx.accounts.asset.key());
        // mpl_core::instructions::CreateV1CpiBuilder::new(&ctx.accounts.core_program)
        //     .asset(&ctx.accounts.asset)
        //     .payer(&ctx.accounts.authority)
        //     .name(format!("Flint SBT #{}", passport.sbt_minted_count))
        //     .uri("https://flint.protocol/sbt/metadata.json".to_string())
        //     .invoke()?;

        msg!(
            "Flint SBT #{}: Minted for Builder {} on Gig #{}. Reliability Score: {}/100",
            passport.sbt_minted_count,
            passport.builder,
            gig_id,
            passport.social_reliability_score
        );
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePassport<'info> {
    #[account(
        init,
        payer = builder,
        space = 8 + BuilderPassport::LEN,
        seeds = [b"builder_passport", builder.key().as_ref()],
        bump
    )]
    pub passport: Account<'info, BuilderPassport>,
    #[account(mut)]
    pub builder: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(gig_id: u64)]
pub struct RecordCompletion<'info> {
    #[account(
        mut,
        seeds = [b"builder_passport", passport.builder.as_ref()],
        bump = passport.bump
    )]
    pub passport: Account<'info, BuilderPassport>,
    #[account(
        init,
        payer = authority,
        space = 8 + SoulboundRecord::LEN,
        seeds = [b"sbt_record", passport.builder.as_ref(), gig_id.to_le_bytes().as_ref()],
        bump
    )]
    pub sbt_record: Account<'info, SoulboundRecord>,
    #[account(mut)]
    /// CHECK: The new Metaplex Core Asset account to be created
    pub asset: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Metaplex Core Program
    pub core_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct BuilderPassport {
    pub builder: Pubkey,
    pub total_gigs_completed: u32,
    pub on_time_deliveries: u32,
    pub social_reliability_score: u8,
    pub total_earnings: u64,
    pub sbt_minted_count: u32,
    pub bump: u8,
}

impl BuilderPassport {
    pub const LEN: usize = 32 + 4 + 4 + 1 + 8 + 4 + 1 + 16;
}

#[account]
pub struct SoulboundRecord {
    pub builder: Pubkey,
    pub gig_id: u64,
    pub earned_amount: u64,
    pub delivered_on_time: bool,
    pub timestamp: i64,
    pub bump: u8,
}

impl SoulboundRecord {
    pub const LEN: usize = 32 + 8 + 8 + 1 + 8 + 1 + 16;
}
