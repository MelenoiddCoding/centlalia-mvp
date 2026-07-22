use anchor_lang::prelude::*;

pub mod asset;
pub mod contexts;
pub mod domain;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use contexts::*;
use state::{AssetStandard, EventDetails};

declare_id!("6KVngKJVYYbqfeXxzXdnaZzmKwo58iin8LmiMyZjgpbu");

#[program]
pub mod centlalia_ticketing {
    use super::*;

    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        platform_fee_bps: u16,
        asset_standard: AssetStandard,
    ) -> Result<()> {
        instructions::initialize_platform(ctx, platform_fee_bps, asset_standard)
    }

    pub fn update_platform(
        ctx: Context<UpdatePlatform>,
        platform_fee_bps: u16,
        paused: bool,
    ) -> Result<()> {
        instructions::update_platform(ctx, platform_fee_bps, paused)
    }

    pub fn set_asset_standard(
        ctx: Context<UpdatePlatform>,
        asset_standard: AssetStandard,
    ) -> Result<()> {
        instructions::set_asset_standard(ctx, asset_standard)
    }

    pub fn create_event(
        ctx: Context<CreateEvent>,
        event_id: u64,
        details: EventDetails,
    ) -> Result<()> {
        instructions::create_event(ctx, event_id, details)
    }

    pub fn update_event(ctx: Context<ManageEvent>, details: EventDetails) -> Result<()> {
        instructions::update_event(ctx, details)
    }

    pub fn publish_event(ctx: Context<ManageEvent>) -> Result<()> {
        instructions::publish_event(ctx)
    }

    pub fn cancel_event(ctx: Context<ManageEvent>) -> Result<()> {
        instructions::cancel_event(ctx)
    }

    pub fn close_event(ctx: Context<ManageEvent>) -> Result<()> {
        instructions::close_event(ctx)
    }

    pub fn add_tier(
        ctx: Context<AddTier>,
        tier_id: u16,
        name: String,
        price_lamports: u64,
        supply: u32,
    ) -> Result<()> {
        instructions::add_tier(ctx, tier_id, name, price_lamports, supply)
    }

    pub fn update_tier(
        ctx: Context<UpdateTier>,
        name: String,
        price_lamports: u64,
        supply: u32,
        active: bool,
    ) -> Result<()> {
        instructions::update_tier(ctx, name, price_lamports, supply, active)
    }

    pub fn authorize_staff(ctx: Context<AuthorizeStaff>) -> Result<()> {
        instructions::authorize_staff(ctx)
    }

    pub fn revoke_staff(ctx: Context<RevokeStaff>) -> Result<()> {
        instructions::revoke_staff(ctx)
    }

    pub fn primary_purchase(ctx: Context<PrimaryPurchase>, ticket_id: u64) -> Result<()> {
        instructions::primary_purchase(ctx, ticket_id)
    }

    pub fn primary_purchase_core(ctx: Context<PrimaryPurchaseCore>, ticket_id: u64) -> Result<()> {
        instructions::primary_purchase_core(ctx, ticket_id)
    }

    pub fn gift_ticket(ctx: Context<GiftTicket>) -> Result<()> {
        instructions::gift_ticket(ctx)
    }

    pub fn list_ticket(
        ctx: Context<ListTicket>,
        listing_id: u32,
        price_lamports: u64,
        expires_at: i64,
    ) -> Result<()> {
        instructions::list_ticket(ctx, listing_id, price_lamports, expires_at)
    }

    pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> {
        instructions::cancel_listing(ctx)
    }

    pub fn buy_resale(ctx: Context<BuyResale>) -> Result<()> {
        instructions::buy_resale(ctx)
    }

    pub fn present_check_in(
        ctx: Context<PresentCheckIn>,
        intent_nonce: u64,
        expires_at: i64,
    ) -> Result<()> {
        instructions::present_check_in(ctx, intent_nonce, expires_at)
    }

    pub fn present_check_in_core(
        ctx: Context<PresentCheckInCore>,
        intent_nonce: u64,
        expires_at: i64,
    ) -> Result<()> {
        instructions::present_check_in_core(ctx, intent_nonce, expires_at)
    }

    pub fn cancel_check_in(ctx: Context<CancelCheckIn>) -> Result<()> {
        instructions::cancel_check_in(ctx)
    }

    pub fn expire_check_in(ctx: Context<ExpireCheckIn>) -> Result<()> {
        instructions::expire_check_in(ctx)
    }

    pub fn consume_check_in(ctx: Context<ConsumeCheckIn>) -> Result<()> {
        instructions::consume_check_in(ctx)
    }

    pub fn consume_check_in_core(ctx: Context<ConsumeCheckInCore>) -> Result<()> {
        instructions::consume_check_in_core(ctx)
    }
}
