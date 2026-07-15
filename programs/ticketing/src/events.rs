use anchor_lang::prelude::*;

#[event]
pub struct PrimaryPurchaseRecorded {
    pub event: Pubkey,
    pub ticket: Pubkey,
    pub asset_id: Pubkey,
    pub buyer: Pubkey,
    pub price_lamports: u64,
}

#[event]
pub struct TicketOwnershipTransferred {
    pub ticket: Pubkey,
    pub asset_id: Pubkey,
    pub previous_owner: Pubkey,
    pub new_owner: Pubkey,
    pub via_resale: bool,
}

#[event]
pub struct CheckInConsumed {
    pub event: Pubkey,
    pub ticket: Pubkey,
    pub holder: Pubkey,
    pub staff: Pubkey,
    pub consumed_at: i64,
}
