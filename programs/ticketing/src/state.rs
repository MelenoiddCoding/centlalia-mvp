use anchor_lang::prelude::*;

pub const BPS_DENOMINATOR: u64 = 10_000;
pub const MAX_EVENT_TITLE_LEN: usize = 80;
pub const MAX_METADATA_URI_LEN: usize = 200;
pub const MAX_TIER_NAME_LEN: usize = 48;
pub const MAX_CHECK_IN_INTENT_SECONDS: i64 = 5 * 60;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum AssetStandard {
    #[default]
    Managed,
    BubblegumV2,
    MplCore,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum EventStatus {
    #[default]
    Draft,
    Published,
    Cancelled,
    Closed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum TicketStatus {
    #[default]
    Active,
    Listed,
    Used,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ListingStatus {
    #[default]
    Active,
    Cancelled,
    Filled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum CheckInIntentStatus {
    #[default]
    Pending,
    Cancelled,
    Expired,
    Consumed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct EventDetails {
    pub title: String,
    pub metadata_uri: String,
    pub sales_start_at: i64,
    pub sales_end_at: i64,
    pub starts_at: i64,
    pub ends_at: i64,
    pub check_in_start_at: i64,
    pub check_in_end_at: i64,
    pub max_resale_markup_bps: u16,
    pub organizer_royalty_bps: u16,
    pub resale_enabled: bool,
}

#[account]
pub struct PlatformConfig {
    pub admin: Pubkey,
    pub treasury: Pubkey,
    pub asset_standard: AssetStandard,
    pub platform_fee_bps: u16,
    pub paused: bool,
    pub bump: u8,
    pub asset_authority_bump: u8,
    pub created_at: i64,
    pub version: u8,
}

impl PlatformConfig {
    pub const SPACE: usize = 8 + 32 + 32 + 1 + 2 + 1 + 1 + 1 + 8 + 1;
}

#[account]
pub struct Event {
    pub organizer: Pubkey,
    pub platform_treasury: Pubkey,
    pub event_id: u64,
    pub title: String,
    pub metadata_uri: String,
    pub sales_start_at: i64,
    pub sales_end_at: i64,
    pub starts_at: i64,
    pub ends_at: i64,
    pub check_in_start_at: i64,
    pub check_in_end_at: i64,
    pub max_resale_markup_bps: u16,
    pub organizer_royalty_bps: u16,
    pub platform_fee_bps: u16,
    pub resale_enabled: bool,
    pub status: EventStatus,
    pub next_tier_id: u16,
    pub next_ticket_id: u64,
    pub bump: u8,
    pub created_at: i64,
}

impl Event {
    pub const SPACE: usize = 8
        + 32
        + 32
        + 8
        + 4
        + MAX_EVENT_TITLE_LEN
        + 4
        + MAX_METADATA_URI_LEN
        + (8 * 6)
        + 2
        + 2
        + 2
        + 1
        + 1
        + 2
        + 8
        + 1
        + 8;
}

#[account]
pub struct Tier {
    pub event: Pubkey,
    pub tier_id: u16,
    pub name: String,
    pub price_lamports: u64,
    pub supply: u32,
    pub sold: u32,
    pub active: bool,
    pub bump: u8,
    pub created_at: i64,
}

impl Tier {
    pub const SPACE: usize = 8 + 32 + 2 + 4 + MAX_TIER_NAME_LEN + 8 + 4 + 4 + 1 + 1 + 8;
}

#[account]
pub struct TicketRecord {
    pub event: Pubkey,
    pub tier: Pubkey,
    pub serial: u64,
    pub asset_id: Pubkey,
    pub asset_standard: AssetStandard,
    pub owner: Pubkey,
    pub original_price_lamports: u64,
    pub status: TicketStatus,
    pub transfer_count: u32,
    pub used_at: Option<i64>,
    pub used_by: Option<Pubkey>,
    pub next_listing_id: u32,
    pub next_intent_nonce: u64,
    pub active_intent: Option<Pubkey>,
    pub bump: u8,
    pub created_at: i64,
}

impl TicketRecord {
    pub const SPACE: usize =
        8 + 32 + 32 + 8 + 32 + 1 + 32 + 8 + 1 + 4 + 9 + 33 + 4 + 8 + 33 + 1 + 8;
}

/// Canonical MVP asset ownership record.
///
/// Bubblegum/Core tickets must not use this account: they require a CPI adapter
/// that proves the external asset transfer before `TicketRecord.owner` changes.
#[account]
pub struct ManagedAsset {
    pub authority: Pubkey,
    pub owner: Pubkey,
    pub ticket: Pubkey,
    pub standard: AssetStandard,
    pub bump: u8,
    pub created_at: i64,
}

impl ManagedAsset {
    pub const SPACE: usize = 8 + 32 + 32 + 32 + 1 + 1 + 8;
}

#[account]
pub struct Listing {
    pub ticket: Pubkey,
    pub event: Pubkey,
    pub seller: Pubkey,
    pub listing_id: u32,
    pub price_lamports: u64,
    pub status: ListingStatus,
    pub created_at: i64,
    pub expires_at: Option<i64>,
    pub buyer: Option<Pubkey>,
    pub bump: u8,
}

impl Listing {
    pub const SPACE: usize = 8 + 32 + 32 + 32 + 4 + 8 + 1 + 8 + 9 + 33 + 1;
}

#[account]
pub struct StaffAuthorization {
    pub event: Pubkey,
    pub staff: Pubkey,
    pub active: bool,
    pub authorized_at: i64,
    pub revoked_at: Option<i64>,
    pub bump: u8,
}

impl StaffAuthorization {
    pub const SPACE: usize = 8 + 32 + 32 + 1 + 8 + 9 + 1;
}

#[account]
pub struct CheckInIntent {
    pub ticket: Pubkey,
    pub event: Pubkey,
    pub holder: Pubkey,
    pub nonce: u64,
    pub expires_at: i64,
    pub status: CheckInIntentStatus,
    pub created_at: i64,
    pub consumed_at: Option<i64>,
    pub staff: Option<Pubkey>,
    pub bump: u8,
}

impl CheckInIntent {
    pub const SPACE: usize = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 8 + 9 + 33 + 1;
}
