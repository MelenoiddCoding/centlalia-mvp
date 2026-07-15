use anchor_lang::prelude::*;

use crate::{
    errors::TicketingError,
    state::{Event, Listing, ManagedAsset, PlatformConfig, TicketRecord, Tier},
};

#[derive(Accounts)]
#[instruction(ticket_id: u64)]
pub struct PrimaryPurchase<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(seeds = [b"platform"], bump = platform_config.bump)]
    pub platform_config: Account<'info, PlatformConfig>,
    #[account(mut, has_one = organizer)]
    pub event: Account<'info, Event>,
    #[account(
        mut,
        constraint = tier.event == event.key() @ TicketingError::InvalidRelationship
    )]
    pub tier: Account<'info, Tier>,
    #[account(mut, address = event.organizer)]
    pub organizer: SystemAccount<'info>,
    #[account(mut, address = event.platform_treasury)]
    pub treasury: SystemAccount<'info>,
    #[account(
        init,
        payer = buyer,
        space = TicketRecord::SPACE,
        seeds = [b"ticket", event.key().as_ref(), &ticket_id.to_le_bytes()],
        bump
    )]
    pub ticket_record: Account<'info, TicketRecord>,
    #[account(
        init,
        payer = buyer,
        space = ManagedAsset::SPACE,
        seeds = [b"managed-asset", ticket_record.key().as_ref()],
        bump
    )]
    pub managed_asset: Account<'info, ManagedAsset>,
    /// CHECK: Its PDA is the immutable authority stored in the managed asset.
    #[account(
        seeds = [b"asset-authority", platform_config.key().as_ref()],
        bump = platform_config.asset_authority_bump
    )]
    pub asset_authority: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GiftTicket<'info> {
    pub current_owner: Signer<'info>,
    pub recipient: SystemAccount<'info>,
    #[account(seeds = [b"platform"], bump = platform_config.bump)]
    pub platform_config: Account<'info, PlatformConfig>,
    pub event: Account<'info, Event>,
    #[account(
        mut,
        constraint = ticket_record.event == event.key() @ TicketingError::InvalidRelationship
    )]
    pub ticket_record: Account<'info, TicketRecord>,
    #[account(
        mut,
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
}

#[derive(Accounts)]
#[instruction(listing_id: u32)]
pub struct ListTicket<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,
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
        payer = seller,
        space = Listing::SPACE,
        seeds = [b"listing", ticket_record.key().as_ref(), &listing_id.to_le_bytes()],
        bump
    )]
    pub listing: Account<'info, Listing>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelListing<'info> {
    pub seller: Signer<'info>,
    #[account(seeds = [b"platform"], bump = platform_config.bump)]
    pub platform_config: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub ticket_record: Account<'info, TicketRecord>,
    #[account(
        mut,
        constraint = listing.ticket == ticket_record.key() @ TicketingError::InvalidRelationship,
        constraint = listing.event == ticket_record.event @ TicketingError::InvalidRelationship
    )]
    pub listing: Account<'info, Listing>,
}

#[derive(Accounts)]
pub struct BuyResale<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(seeds = [b"platform"], bump = platform_config.bump)]
    pub platform_config: Account<'info, PlatformConfig>,
    #[account(has_one = organizer)]
    pub event: Account<'info, Event>,
    #[account(
        mut,
        constraint = ticket_record.event == event.key() @ TicketingError::InvalidRelationship
    )]
    pub ticket_record: Account<'info, TicketRecord>,
    #[account(
        mut,
        constraint = listing.ticket == ticket_record.key() @ TicketingError::InvalidRelationship,
        constraint = listing.event == event.key() @ TicketingError::InvalidRelationship,
        constraint = listing.seller == seller.key() @ TicketingError::InvalidRelationship
    )]
    pub listing: Account<'info, Listing>,
    #[account(mut, address = listing.seller)]
    pub seller: SystemAccount<'info>,
    #[account(mut, address = event.organizer)]
    pub organizer: SystemAccount<'info>,
    #[account(mut, address = event.platform_treasury)]
    pub treasury: SystemAccount<'info>,
    #[account(
        mut,
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
    pub system_program: Program<'info, System>,
}
