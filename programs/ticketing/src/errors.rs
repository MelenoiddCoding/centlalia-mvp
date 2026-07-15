use anchor_lang::prelude::*;

#[error_code]
pub enum TicketingError {
    #[msg("The platform is paused")]
    PlatformPaused,
    #[msg("The requested asset standard does not yet have a verified CPI adapter")]
    UnsupportedAssetStandard,
    #[msg("The supplied account is not the canonical asset for this ticket")]
    InvalidAsset,
    #[msg("The canonical asset owner and ticket owner differ")]
    AssetOwnerMismatch,
    #[msg("The canonical asset authority is invalid")]
    InvalidAssetAuthority,
    #[msg("Basis points must be at most 10,000")]
    InvalidBasisPoints,
    #[msg("Platform fee and organizer royalty exceed 100%")]
    InvalidFeeConfiguration,
    #[msg("Event title is empty or too long")]
    InvalidEventTitle,
    #[msg("Event metadata URI is too long")]
    InvalidMetadataUri,
    #[msg("Event time windows are invalid")]
    InvalidEventWindows,
    #[msg("The event is not in the required state")]
    InvalidEventState,
    #[msg("The event must contain at least one tier before publication")]
    EventHasNoTiers,
    #[msg("The event sales window is closed")]
    SalesClosed,
    #[msg("The event check-in window is closed")]
    CheckInClosed,
    #[msg("The event transfer window is closed")]
    TransferClosed,
    #[msg("The event has not ended")]
    EventNotEnded,
    #[msg("Tier name is empty or too long")]
    InvalidTierName,
    #[msg("Tier supply must be greater than zero")]
    InvalidTierSupply,
    #[msg("Tier supply cannot be reduced below sold inventory")]
    SupplyBelowSales,
    #[msg("The tier is inactive")]
    TierInactive,
    #[msg("The tier is sold out")]
    TierSoldOut,
    #[msg("The event, tier, ticket, listing, or intent relationship is invalid")]
    InvalidRelationship,
    #[msg("The supplied sequence number is not the next expected value")]
    InvalidSequence,
    #[msg("The ticket is not active")]
    TicketNotActive,
    #[msg("The ticket has already been used")]
    TicketAlreadyUsed,
    #[msg("The signer does not own the ticket")]
    NotTicketOwner,
    #[msg("A ticket cannot be transferred to its current owner")]
    SameOwner,
    #[msg("Free tickets cannot be listed for paid resale")]
    FreeTicketResale,
    #[msg("The resale price is zero or exceeds the event markup limit")]
    InvalidResalePrice,
    #[msg("The listing expiry is invalid")]
    InvalidListingExpiry,
    #[msg("The listing is not active")]
    ListingNotActive,
    #[msg("The listing has expired")]
    ListingExpired,
    #[msg("The buyer cannot also be the seller")]
    SellerCannotBuy,
    #[msg("The staff authorization is already active")]
    StaffAlreadyAuthorized,
    #[msg("The staff authorization is not active")]
    StaffNotAuthorized,
    #[msg("The check-in intent expiry is outside the allowed range")]
    InvalidIntentExpiry,
    #[msg("The check-in intent is not pending")]
    IntentNotPending,
    #[msg("The check-in intent has expired")]
    IntentExpired,
    #[msg("The check-in intent has not expired")]
    IntentNotExpired,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("A published event with issued tickets requires a refund policy before cancellation")]
    EventHasTickets,
}
