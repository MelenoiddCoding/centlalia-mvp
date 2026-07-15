use anchor_lang::prelude::*;

use crate::{
    asset::{require_supported_standard, transfer_managed_asset, verify_managed_asset},
    contexts::{BuyResale, CancelListing, GiftTicket, ListTicket, PrimaryPurchase},
    domain::{max_resale_price, primary_split, resale_split},
    errors::TicketingError,
    events::{PrimaryPurchaseRecorded, TicketOwnershipTransferred},
    state::{AssetStandard, EventStatus, ListingStatus, TicketStatus},
};

use super::{
    require_active_ticket, require_platform_active, require_transfer_open, transfer_lamports,
};

pub fn primary_purchase(ctx: Context<PrimaryPurchase>, ticket_id: u64) -> Result<()> {
    require_platform_active(&ctx.accounts.platform_config)?;
    require_supported_standard(ctx.accounts.platform_config.asset_standard)?;
    let now = Clock::get()?.unix_timestamp;
    require!(
        ctx.accounts.event.status == EventStatus::Published,
        TicketingError::InvalidEventState
    );
    require!(
        now >= ctx.accounts.event.sales_start_at && now <= ctx.accounts.event.sales_end_at,
        TicketingError::SalesClosed
    );
    require!(ctx.accounts.tier.active, TicketingError::TierInactive);
    require!(
        ctx.accounts.tier.sold < ctx.accounts.tier.supply,
        TicketingError::TierSoldOut
    );
    require!(
        ticket_id == ctx.accounts.event.next_ticket_id,
        TicketingError::InvalidSequence
    );

    let price = ctx.accounts.tier.price_lamports;
    let (organizer_lamports, platform_lamports) =
        primary_split(price, ctx.accounts.event.platform_fee_bps)?;
    transfer_lamports(
        &ctx.accounts.buyer,
        &ctx.accounts.organizer,
        &ctx.accounts.system_program,
        organizer_lamports,
    )?;
    transfer_lamports(
        &ctx.accounts.buyer,
        &ctx.accounts.treasury,
        &ctx.accounts.system_program,
        platform_lamports,
    )?;

    let event_key = ctx.accounts.event.key();
    let tier_key = ctx.accounts.tier.key();
    let ticket_key = ctx.accounts.ticket_record.key();
    let asset_key = ctx.accounts.managed_asset.key();
    let authority_key = ctx.accounts.asset_authority.key();
    let owner = ctx.accounts.buyer.key();
    {
        let ticket = &mut ctx.accounts.ticket_record;
        ticket.event = event_key;
        ticket.tier = tier_key;
        ticket.serial = ticket_id;
        ticket.asset_id = asset_key;
        ticket.asset_standard = AssetStandard::Managed;
        ticket.owner = owner;
        ticket.original_price_lamports = price;
        ticket.status = TicketStatus::Active;
        ticket.transfer_count = 0;
        ticket.used_at = None;
        ticket.used_by = None;
        ticket.next_listing_id = 0;
        ticket.next_intent_nonce = 0;
        ticket.active_intent = None;
        ticket.bump = ctx.bumps.ticket_record;
        ticket.created_at = now;
    }
    {
        let asset = &mut ctx.accounts.managed_asset;
        asset.authority = authority_key;
        asset.owner = owner;
        asset.ticket = ticket_key;
        asset.standard = AssetStandard::Managed;
        asset.bump = ctx.bumps.managed_asset;
        asset.created_at = now;
    }

    ctx.accounts.tier.sold = ctx
        .accounts
        .tier
        .sold
        .checked_add(1)
        .ok_or(TicketingError::ArithmeticOverflow)?;
    ctx.accounts.event.next_ticket_id = ctx
        .accounts
        .event
        .next_ticket_id
        .checked_add(1)
        .ok_or(TicketingError::ArithmeticOverflow)?;

    emit!(PrimaryPurchaseRecorded {
        event: event_key,
        ticket: ticket_key,
        asset_id: asset_key,
        buyer: owner,
        price_lamports: price,
    });
    Ok(())
}

pub fn gift_ticket(ctx: Context<GiftTicket>) -> Result<()> {
    require_platform_active(&ctx.accounts.platform_config)?;
    require_transfer_open(&ctx.accounts.event)?;
    require_active_ticket(&ctx.accounts.ticket_record)?;
    require_keys_eq!(
        ctx.accounts.ticket_record.owner,
        ctx.accounts.current_owner.key(),
        TicketingError::NotTicketOwner
    );
    verify_managed_asset(
        ctx.accounts.managed_asset.key(),
        &ctx.accounts.managed_asset,
        ctx.accounts.ticket_record.key(),
        &ctx.accounts.ticket_record,
        ctx.accounts.asset_authority.key(),
    )?;

    let ticket_key = ctx.accounts.ticket_record.key();
    let asset_key = ctx.accounts.managed_asset.key();
    let previous_owner = ctx.accounts.current_owner.key();
    let recipient = ctx.accounts.recipient.key();
    transfer_managed_asset(
        &mut ctx.accounts.managed_asset,
        &mut ctx.accounts.ticket_record,
        recipient,
    )?;
    emit!(TicketOwnershipTransferred {
        ticket: ticket_key,
        asset_id: asset_key,
        previous_owner,
        new_owner: recipient,
        via_resale: false,
    });
    Ok(())
}

pub fn list_ticket(
    ctx: Context<ListTicket>,
    listing_id: u32,
    price_lamports: u64,
    expires_at: i64,
) -> Result<()> {
    require_platform_active(&ctx.accounts.platform_config)?;
    require_transfer_open(&ctx.accounts.event)?;
    require!(
        ctx.accounts.event.resale_enabled,
        TicketingError::InvalidEventState
    );
    require_active_ticket(&ctx.accounts.ticket_record)?;
    require_keys_eq!(
        ctx.accounts.ticket_record.owner,
        ctx.accounts.seller.key(),
        TicketingError::NotTicketOwner
    );
    require!(
        listing_id == ctx.accounts.ticket_record.next_listing_id,
        TicketingError::InvalidSequence
    );
    require!(
        ctx.accounts.ticket_record.original_price_lamports > 0,
        TicketingError::FreeTicketResale
    );
    let maximum = max_resale_price(
        ctx.accounts.ticket_record.original_price_lamports,
        ctx.accounts.event.max_resale_markup_bps,
    )?;
    require!(
        price_lamports > 0 && price_lamports <= maximum,
        TicketingError::InvalidResalePrice
    );
    let now = Clock::get()?.unix_timestamp;
    require!(
        expires_at > now && expires_at <= ctx.accounts.event.check_in_start_at,
        TicketingError::InvalidListingExpiry
    );
    verify_managed_asset(
        ctx.accounts.managed_asset.key(),
        &ctx.accounts.managed_asset,
        ctx.accounts.ticket_record.key(),
        &ctx.accounts.ticket_record,
        ctx.accounts.asset_authority.key(),
    )?;

    let ticket_key = ctx.accounts.ticket_record.key();
    let event_key = ctx.accounts.event.key();
    let listing = &mut ctx.accounts.listing;
    listing.ticket = ticket_key;
    listing.event = event_key;
    listing.seller = ctx.accounts.seller.key();
    listing.listing_id = listing_id;
    listing.price_lamports = price_lamports;
    listing.status = ListingStatus::Active;
    listing.created_at = now;
    listing.expires_at = Some(expires_at);
    listing.buyer = None;
    listing.bump = ctx.bumps.listing;
    ctx.accounts.ticket_record.status = TicketStatus::Listed;
    ctx.accounts.ticket_record.next_listing_id = ctx
        .accounts
        .ticket_record
        .next_listing_id
        .checked_add(1)
        .ok_or(TicketingError::ArithmeticOverflow)?;
    Ok(())
}

pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> {
    require!(
        ctx.accounts.listing.status == ListingStatus::Active,
        TicketingError::ListingNotActive
    );
    require!(
        ctx.accounts.ticket_record.status == TicketStatus::Listed,
        TicketingError::TicketNotActive
    );
    require_keys_eq!(
        ctx.accounts.listing.seller,
        ctx.accounts.seller.key(),
        TicketingError::NotTicketOwner
    );
    require_keys_eq!(
        ctx.accounts.ticket_record.owner,
        ctx.accounts.seller.key(),
        TicketingError::NotTicketOwner
    );
    ctx.accounts.listing.status = ListingStatus::Cancelled;
    ctx.accounts.ticket_record.status = TicketStatus::Active;
    Ok(())
}

pub fn buy_resale(ctx: Context<BuyResale>) -> Result<()> {
    require_platform_active(&ctx.accounts.platform_config)?;
    require_transfer_open(&ctx.accounts.event)?;
    require!(
        ctx.accounts.listing.status == ListingStatus::Active,
        TicketingError::ListingNotActive
    );
    require!(
        ctx.accounts.ticket_record.status == TicketStatus::Listed,
        TicketingError::TicketNotActive
    );
    require_keys_neq!(
        ctx.accounts.buyer.key(),
        ctx.accounts.seller.key(),
        TicketingError::SellerCannotBuy
    );
    require_keys_eq!(
        ctx.accounts.ticket_record.owner,
        ctx.accounts.seller.key(),
        TicketingError::AssetOwnerMismatch
    );
    let now = Clock::get()?.unix_timestamp;
    require!(
        ctx.accounts
            .listing
            .expires_at
            .is_some_and(|expiry| now < expiry),
        TicketingError::ListingExpired
    );
    verify_managed_asset(
        ctx.accounts.managed_asset.key(),
        &ctx.accounts.managed_asset,
        ctx.accounts.ticket_record.key(),
        &ctx.accounts.ticket_record,
        ctx.accounts.asset_authority.key(),
    )?;

    let price = ctx.accounts.listing.price_lamports;
    let split = resale_split(
        price,
        ctx.accounts.event.platform_fee_bps,
        ctx.accounts.event.organizer_royalty_bps,
    )?;
    transfer_lamports(
        &ctx.accounts.buyer,
        &ctx.accounts.seller,
        &ctx.accounts.system_program,
        split.seller_lamports,
    )?;
    transfer_lamports(
        &ctx.accounts.buyer,
        &ctx.accounts.organizer,
        &ctx.accounts.system_program,
        split.organizer_lamports,
    )?;
    transfer_lamports(
        &ctx.accounts.buyer,
        &ctx.accounts.treasury,
        &ctx.accounts.system_program,
        split.platform_lamports,
    )?;

    let ticket_key = ctx.accounts.ticket_record.key();
    let asset_key = ctx.accounts.managed_asset.key();
    let previous_owner = ctx.accounts.seller.key();
    let buyer = ctx.accounts.buyer.key();
    transfer_managed_asset(
        &mut ctx.accounts.managed_asset,
        &mut ctx.accounts.ticket_record,
        buyer,
    )?;
    ctx.accounts.ticket_record.status = TicketStatus::Active;
    ctx.accounts.listing.status = ListingStatus::Filled;
    ctx.accounts.listing.buyer = Some(buyer);

    emit!(TicketOwnershipTransferred {
        ticket: ticket_key,
        asset_id: asset_key,
        previous_owner,
        new_owner: buyer,
        via_resale: true,
    });
    Ok(())
}
