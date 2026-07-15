use anchor_lang::prelude::*;

use crate::{
    asset::require_supported_standard,
    contexts::{
        AddTier, AuthorizeStaff, CreateEvent, InitializePlatform, ManageEvent, RevokeStaff,
        UpdatePlatform, UpdateTier,
    },
    domain::{
        validate_bps, validate_event_cancellation, validate_event_details,
        validate_fee_configuration, validate_tier,
    },
    errors::TicketingError,
    state::{AssetStandard, EventDetails, EventStatus},
};

use super::{apply_event_details, require_platform_active};

pub fn initialize_platform(
    ctx: Context<InitializePlatform>,
    platform_fee_bps: u16,
    asset_standard: AssetStandard,
) -> Result<()> {
    validate_bps(platform_fee_bps)?;
    require_supported_standard(asset_standard)?;

    let now = Clock::get()?.unix_timestamp;
    let config = &mut ctx.accounts.platform_config;
    config.admin = ctx.accounts.admin.key();
    config.treasury = ctx.accounts.treasury.key();
    config.asset_standard = asset_standard;
    config.platform_fee_bps = platform_fee_bps;
    config.paused = false;
    config.bump = ctx.bumps.platform_config;
    config.asset_authority_bump = ctx.bumps.asset_authority;
    config.created_at = now;
    config.version = 1;
    Ok(())
}

pub fn update_platform(
    ctx: Context<UpdatePlatform>,
    platform_fee_bps: u16,
    paused: bool,
) -> Result<()> {
    validate_bps(platform_fee_bps)?;
    let config = &mut ctx.accounts.platform_config;
    config.treasury = ctx.accounts.treasury.key();
    config.platform_fee_bps = platform_fee_bps;
    config.paused = paused;
    Ok(())
}

pub fn create_event(ctx: Context<CreateEvent>, event_id: u64, details: EventDetails) -> Result<()> {
    require_platform_active(&ctx.accounts.platform_config)?;
    validate_event_details(&details, ctx.accounts.platform_config.platform_fee_bps)?;

    let event = &mut ctx.accounts.event;
    event.organizer = ctx.accounts.organizer.key();
    event.platform_treasury = ctx.accounts.platform_config.treasury;
    event.platform_fee_bps = ctx.accounts.platform_config.platform_fee_bps;
    event.event_id = event_id;
    apply_event_details(event, details);
    event.status = EventStatus::Draft;
    event.next_tier_id = 0;
    event.next_ticket_id = 0;
    event.bump = ctx.bumps.event;
    event.created_at = Clock::get()?.unix_timestamp;
    Ok(())
}

pub fn update_event(ctx: Context<ManageEvent>, details: EventDetails) -> Result<()> {
    require_platform_active(&ctx.accounts.platform_config)?;
    require!(
        ctx.accounts.event.status == EventStatus::Draft,
        TicketingError::InvalidEventState
    );
    validate_event_details(&details, ctx.accounts.platform_config.platform_fee_bps)?;
    apply_event_details(&mut ctx.accounts.event, details);
    Ok(())
}

pub fn publish_event(ctx: Context<ManageEvent>) -> Result<()> {
    require_platform_active(&ctx.accounts.platform_config)?;
    let event = &mut ctx.accounts.event;
    require!(
        event.status == EventStatus::Draft,
        TicketingError::InvalidEventState
    );
    require!(event.next_tier_id > 0, TicketingError::EventHasNoTiers);
    require!(
        Clock::get()?.unix_timestamp < event.sales_end_at,
        TicketingError::SalesClosed
    );
    validate_fee_configuration(
        ctx.accounts.platform_config.platform_fee_bps,
        event.organizer_royalty_bps,
    )?;
    event.platform_treasury = ctx.accounts.platform_config.treasury;
    event.platform_fee_bps = ctx.accounts.platform_config.platform_fee_bps;
    event.status = EventStatus::Published;
    Ok(())
}

pub fn cancel_event(ctx: Context<ManageEvent>) -> Result<()> {
    require_platform_active(&ctx.accounts.platform_config)?;
    let event = &mut ctx.accounts.event;
    require!(
        matches!(event.status, EventStatus::Draft | EventStatus::Published),
        TicketingError::InvalidEventState
    );
    validate_event_cancellation(event.status, event.next_ticket_id)?;
    event.status = EventStatus::Cancelled;
    Ok(())
}

pub fn close_event(ctx: Context<ManageEvent>) -> Result<()> {
    let event = &mut ctx.accounts.event;
    require!(
        event.status == EventStatus::Published,
        TicketingError::InvalidEventState
    );
    require!(
        Clock::get()?.unix_timestamp >= event.ends_at,
        TicketingError::EventNotEnded
    );
    event.status = EventStatus::Closed;
    Ok(())
}

pub fn add_tier(
    ctx: Context<AddTier>,
    tier_id: u16,
    name: String,
    price_lamports: u64,
    supply: u32,
) -> Result<()> {
    require_platform_active(&ctx.accounts.platform_config)?;
    require!(
        ctx.accounts.event.status == EventStatus::Draft,
        TicketingError::InvalidEventState
    );
    require!(
        tier_id == ctx.accounts.event.next_tier_id,
        TicketingError::InvalidSequence
    );
    validate_tier(&name, supply)?;

    let tier = &mut ctx.accounts.tier;
    tier.event = ctx.accounts.event.key();
    tier.tier_id = tier_id;
    tier.name = name;
    tier.price_lamports = price_lamports;
    tier.supply = supply;
    tier.sold = 0;
    tier.active = true;
    tier.bump = ctx.bumps.tier;
    tier.created_at = Clock::get()?.unix_timestamp;
    ctx.accounts.event.next_tier_id = ctx
        .accounts
        .event
        .next_tier_id
        .checked_add(1)
        .ok_or(TicketingError::ArithmeticOverflow)?;
    Ok(())
}

pub fn update_tier(
    ctx: Context<UpdateTier>,
    name: String,
    price_lamports: u64,
    supply: u32,
    active: bool,
) -> Result<()> {
    require_platform_active(&ctx.accounts.platform_config)?;
    require!(
        ctx.accounts.event.status == EventStatus::Draft,
        TicketingError::InvalidEventState
    );
    validate_tier(&name, supply)?;
    require!(
        supply >= ctx.accounts.tier.sold,
        TicketingError::SupplyBelowSales
    );
    let tier = &mut ctx.accounts.tier;
    tier.name = name;
    tier.price_lamports = price_lamports;
    tier.supply = supply;
    tier.active = active;
    Ok(())
}

pub fn authorize_staff(ctx: Context<AuthorizeStaff>) -> Result<()> {
    require_platform_active(&ctx.accounts.platform_config)?;
    require!(
        matches!(
            ctx.accounts.event.status,
            EventStatus::Draft | EventStatus::Published
        ),
        TicketingError::InvalidEventState
    );

    let authorization = &mut ctx.accounts.staff_authorization;
    require!(
        !authorization.active,
        TicketingError::StaffAlreadyAuthorized
    );
    authorization.event = ctx.accounts.event.key();
    authorization.staff = ctx.accounts.staff.key();
    authorization.active = true;
    authorization.authorized_at = Clock::get()?.unix_timestamp;
    authorization.revoked_at = None;
    authorization.bump = ctx.bumps.staff_authorization;
    Ok(())
}

pub fn revoke_staff(ctx: Context<RevokeStaff>) -> Result<()> {
    require_platform_active(&ctx.accounts.platform_config)?;
    require!(
        ctx.accounts.staff_authorization.active,
        TicketingError::StaffNotAuthorized
    );
    ctx.accounts.staff_authorization.active = false;
    ctx.accounts.staff_authorization.revoked_at = Some(Clock::get()?.unix_timestamp);
    Ok(())
}
