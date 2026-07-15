mod check_in;
mod platform_event;
mod tickets;

pub use check_in::*;
pub use platform_event::*;
pub use tickets::*;

use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer};

use crate::{
    errors::TicketingError,
    state::{Event, EventDetails, EventStatus, PlatformConfig, TicketRecord, TicketStatus},
};

pub(crate) fn apply_event_details(event: &mut Event, details: EventDetails) {
    event.title = details.title;
    event.metadata_uri = details.metadata_uri;
    event.sales_start_at = details.sales_start_at;
    event.sales_end_at = details.sales_end_at;
    event.starts_at = details.starts_at;
    event.ends_at = details.ends_at;
    event.check_in_start_at = details.check_in_start_at;
    event.check_in_end_at = details.check_in_end_at;
    event.max_resale_markup_bps = details.max_resale_markup_bps;
    event.organizer_royalty_bps = details.organizer_royalty_bps;
    event.resale_enabled = details.resale_enabled;
}

pub(crate) fn require_platform_active(config: &PlatformConfig) -> Result<()> {
    require!(!config.paused, TicketingError::PlatformPaused);
    Ok(())
}

pub(crate) fn require_active_ticket(ticket: &TicketRecord) -> Result<()> {
    require!(ticket.used_at.is_none(), TicketingError::TicketAlreadyUsed);
    require!(
        ticket.status == TicketStatus::Active,
        TicketingError::TicketNotActive
    );
    Ok(())
}

pub(crate) fn require_transfer_open(event: &Event) -> Result<()> {
    require!(
        event.status == EventStatus::Published,
        TicketingError::InvalidEventState
    );
    require!(
        Clock::get()?.unix_timestamp < event.check_in_start_at,
        TicketingError::TransferClosed
    );
    Ok(())
}

pub(crate) fn require_check_in_open(event: &Event) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    require!(
        event.status == EventStatus::Published,
        TicketingError::InvalidEventState
    );
    require!(
        now >= event.check_in_start_at && now <= event.check_in_end_at,
        TicketingError::CheckInClosed
    );
    Ok(())
}

pub(crate) fn transfer_lamports<'info>(
    payer: &Signer<'info>,
    recipient: &SystemAccount<'info>,
    system_program_account: &Program<'info, System>,
    amount: u64,
) -> Result<()> {
    if amount == 0 || payer.key() == recipient.key() {
        return Ok(());
    }
    system_program::transfer(
        CpiContext::new(
            system_program_account.key(),
            Transfer {
                from: payer.to_account_info(),
                to: recipient.to_account_info(),
            },
        ),
        amount,
    )
}
