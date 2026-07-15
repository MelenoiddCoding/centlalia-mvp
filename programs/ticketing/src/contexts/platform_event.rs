use anchor_lang::prelude::*;

use crate::{
    errors::TicketingError,
    program::CentlaliaTicketing,
    state::{Event, PlatformConfig, StaffAuthorization, Tier},
};

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = PlatformConfig::SPACE,
        seeds = [b"platform"],
        bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    /// CHECK: PDA used as the authority boundary for managed or CPI-backed assets.
    #[account(
        seeds = [b"asset-authority", platform_config.key().as_ref()],
        bump
    )]
    pub asset_authority: UncheckedAccount<'info>,
    pub treasury: SystemAccount<'info>,
    #[account(
        constraint = program.programdata_address()? == Some(program_data.key())
    )]
    pub program: Program<'info, CentlaliaTicketing>,
    #[account(
        constraint = program_data.upgrade_authority_address == Some(admin.key())
    )]
    pub program_data: Account<'info, ProgramData>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePlatform<'info> {
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [b"platform"],
        bump = platform_config.bump,
        has_one = admin
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    pub treasury: SystemAccount<'info>,
}

#[derive(Accounts)]
#[instruction(event_id: u64)]
pub struct CreateEvent<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,
    #[account(seeds = [b"platform"], bump = platform_config.bump)]
    pub platform_config: Account<'info, PlatformConfig>,
    #[account(
        init,
        payer = organizer,
        space = Event::SPACE,
        seeds = [b"event", organizer.key().as_ref(), &event_id.to_le_bytes()],
        bump
    )]
    pub event: Account<'info, Event>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ManageEvent<'info> {
    pub organizer: Signer<'info>,
    #[account(seeds = [b"platform"], bump = platform_config.bump)]
    pub platform_config: Account<'info, PlatformConfig>,
    #[account(mut, has_one = organizer)]
    pub event: Account<'info, Event>,
}

#[derive(Accounts)]
#[instruction(tier_id: u16)]
pub struct AddTier<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,
    #[account(seeds = [b"platform"], bump = platform_config.bump)]
    pub platform_config: Account<'info, PlatformConfig>,
    #[account(mut, has_one = organizer)]
    pub event: Account<'info, Event>,
    #[account(
        init,
        payer = organizer,
        space = Tier::SPACE,
        seeds = [b"tier", event.key().as_ref(), &tier_id.to_le_bytes()],
        bump
    )]
    pub tier: Account<'info, Tier>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateTier<'info> {
    pub organizer: Signer<'info>,
    #[account(seeds = [b"platform"], bump = platform_config.bump)]
    pub platform_config: Account<'info, PlatformConfig>,
    #[account(mut, has_one = organizer)]
    pub event: Account<'info, Event>,
    #[account(
        mut,
        constraint = tier.event == event.key() @ TicketingError::InvalidRelationship
    )]
    pub tier: Account<'info, Tier>,
}

#[derive(Accounts)]
pub struct AuthorizeStaff<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,
    #[account(seeds = [b"platform"], bump = platform_config.bump)]
    pub platform_config: Account<'info, PlatformConfig>,
    #[account(has_one = organizer)]
    pub event: Account<'info, Event>,
    pub staff: SystemAccount<'info>,
    #[account(
        init_if_needed,
        payer = organizer,
        space = StaffAuthorization::SPACE,
        seeds = [b"staff", event.key().as_ref(), staff.key().as_ref()],
        bump
    )]
    pub staff_authorization: Account<'info, StaffAuthorization>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeStaff<'info> {
    pub organizer: Signer<'info>,
    #[account(seeds = [b"platform"], bump = platform_config.bump)]
    pub platform_config: Account<'info, PlatformConfig>,
    #[account(has_one = organizer)]
    pub event: Account<'info, Event>,
    /// CHECK: Key is constrained by the authorization PDA and stored data.
    pub staff: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"staff", event.key().as_ref(), staff.key().as_ref()],
        bump = staff_authorization.bump,
        constraint = staff_authorization.event == event.key() @ TicketingError::InvalidRelationship,
        constraint = staff_authorization.staff == staff.key() @ TicketingError::InvalidRelationship
    )]
    pub staff_authorization: Account<'info, StaffAuthorization>,
}
