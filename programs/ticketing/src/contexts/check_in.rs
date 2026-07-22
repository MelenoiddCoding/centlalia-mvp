use anchor_lang::prelude::*;

use crate::{
    errors::TicketingError,
    state::{CheckInIntent, Event, ManagedAsset, PlatformConfig, StaffAuthorization, TicketRecord},
};

#[derive(Accounts)]
#[instruction(intent_nonce: u64)]
pub struct PresentCheckIn<'info> {
    #[account(mut)]
    pub holder: Signer<'info>,
    #[account(seeds = [b"platform"], bump = platform_config.bump)]
    pub platform_config: Account<'info, PlatformConfig>,
    pub event: Account<'info, Event>,
    #[account(
        mut,
        constraint = ticket_record.event == event.key() @ TicketingError::InvalidRelationship
    )]
    pub ticket_record: Account<'info, TicketRecord>,
    #[account(
        seeds = [b"managed-asset", ticket_record.key().as_ref()],
        bump = managed_asset.bump
    )]
    pub managed_asset: Account<'info, ManagedAsset>,
    /// CHECK: Verified by PDA seeds and against `ManagedAsset.authority`.
    #[account(
        seeds = [b"asset-authority", platform_config.key().as_ref()],
        bump = platform_config.asset_authority_bump
    )]
    pub asset_authority: UncheckedAccount<'info>,
    #[account(
        init,
        payer = holder,
        space = CheckInIntent::SPACE,
        seeds = [
            b"check-in-intent",
            ticket_record.key().as_ref(),
            &intent_nonce.to_le_bytes()
        ],
        bump
    )]
    pub check_in_intent: Account<'info, CheckInIntent>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(intent_nonce: u64)]
pub struct PresentCheckInCore<'info> {
    #[account(mut)]
    pub holder: Signer<'info>,
    #[account(seeds = [b"platform"], bump = platform_config.bump)]
    pub platform_config: Account<'info, PlatformConfig>,
    pub event: Account<'info, Event>,
    #[account(mut, constraint = ticket_record.event == event.key() @ TicketingError::InvalidRelationship)]
    pub ticket_record: Account<'info, TicketRecord>,
    /// CHECK: Ownership and MPL Core program ownership are verified in the handler.
    #[account(address = ticket_record.asset_id)]
    pub core_asset: UncheckedAccount<'info>,
    /// CHECK: Verified against the Core asset update authority.
    #[account(
        seeds = [b"asset-authority", platform_config.key().as_ref()],
        bump = platform_config.asset_authority_bump
    )]
    pub asset_authority: UncheckedAccount<'info>,
    #[account(
        init,
        payer = holder,
        space = CheckInIntent::SPACE,
        seeds = [b"check-in-intent", ticket_record.key().as_ref(), &intent_nonce.to_le_bytes()],
        bump
    )]
    pub check_in_intent: Account<'info, CheckInIntent>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelCheckIn<'info> {
    pub holder: Signer<'info>,
    #[account(mut)]
    pub ticket_record: Account<'info, TicketRecord>,
    #[account(
        mut,
        constraint = check_in_intent.ticket == ticket_record.key() @ TicketingError::InvalidRelationship
    )]
    pub check_in_intent: Account<'info, CheckInIntent>,
}

#[derive(Accounts)]
pub struct ExpireCheckIn<'info> {
    pub keeper: Signer<'info>,
    #[account(mut)]
    pub ticket_record: Account<'info, TicketRecord>,
    #[account(
        mut,
        constraint = check_in_intent.ticket == ticket_record.key() @ TicketingError::InvalidRelationship
    )]
    pub check_in_intent: Account<'info, CheckInIntent>,
}

#[derive(Accounts)]
pub struct ConsumeCheckIn<'info> {
    pub staff: Signer<'info>,
    #[account(seeds = [b"platform"], bump = platform_config.bump)]
    pub platform_config: Account<'info, PlatformConfig>,
    pub event: Account<'info, Event>,
    #[account(
        mut,
        constraint = ticket_record.event == event.key() @ TicketingError::InvalidRelationship
    )]
    pub ticket_record: Account<'info, TicketRecord>,
    #[account(
        seeds = [b"managed-asset", ticket_record.key().as_ref()],
        bump = managed_asset.bump
    )]
    pub managed_asset: Account<'info, ManagedAsset>,
    /// CHECK: Verified by PDA seeds and against `ManagedAsset.authority`.
    #[account(
        seeds = [b"asset-authority", platform_config.key().as_ref()],
        bump = platform_config.asset_authority_bump
    )]
    pub asset_authority: UncheckedAccount<'info>,
    #[account(
        seeds = [b"staff", event.key().as_ref(), staff.key().as_ref()],
        bump = staff_authorization.bump,
        constraint = staff_authorization.event == event.key() @ TicketingError::InvalidRelationship,
        constraint = staff_authorization.staff == staff.key() @ TicketingError::InvalidRelationship
    )]
    pub staff_authorization: Account<'info, StaffAuthorization>,
    #[account(
        mut,
        constraint = check_in_intent.ticket == ticket_record.key() @ TicketingError::InvalidRelationship,
        constraint = check_in_intent.event == event.key() @ TicketingError::InvalidRelationship
    )]
    pub check_in_intent: Account<'info, CheckInIntent>,
}

#[derive(Accounts)]
pub struct ConsumeCheckInCore<'info> {
    pub staff: Signer<'info>,
    #[account(seeds = [b"platform"], bump = platform_config.bump)]
    pub platform_config: Account<'info, PlatformConfig>,
    pub event: Account<'info, Event>,
    #[account(mut, constraint = ticket_record.event == event.key() @ TicketingError::InvalidRelationship)]
    pub ticket_record: Account<'info, TicketRecord>,
    /// CHECK: Ownership and MPL Core program ownership are verified in the handler.
    #[account(address = ticket_record.asset_id)]
    pub core_asset: UncheckedAccount<'info>,
    /// CHECK: Verified against the Core asset update authority.
    #[account(
        seeds = [b"asset-authority", platform_config.key().as_ref()],
        bump = platform_config.asset_authority_bump
    )]
    pub asset_authority: UncheckedAccount<'info>,
    #[account(
        seeds = [b"staff", event.key().as_ref(), staff.key().as_ref()],
        bump = staff_authorization.bump,
        constraint = staff_authorization.event == event.key() @ TicketingError::InvalidRelationship,
        constraint = staff_authorization.staff == staff.key() @ TicketingError::InvalidRelationship
    )]
    pub staff_authorization: Account<'info, StaffAuthorization>,
    #[account(
        mut,
        constraint = check_in_intent.ticket == ticket_record.key() @ TicketingError::InvalidRelationship,
        constraint = check_in_intent.event == event.key() @ TicketingError::InvalidRelationship
    )]
    pub check_in_intent: Account<'info, CheckInIntent>,
}
