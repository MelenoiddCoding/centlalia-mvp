use anchor_lang::prelude::*;

use crate::{
    asset::{verify_core_asset, verify_managed_asset},
    contexts::{
        CancelCheckIn, ConsumeCheckIn, ConsumeCheckInCore, ExpireCheckIn, PresentCheckIn,
        PresentCheckInCore,
    },
    domain::validate_intent_expiry,
    errors::TicketingError,
    events::CheckInConsumed,
    state::{CheckInIntent, CheckInIntentStatus, TicketRecord, TicketStatus},
};

use super::{require_active_ticket, require_check_in_open, require_platform_active};

pub fn present_check_in(
    ctx: Context<PresentCheckIn>,
    intent_nonce: u64,
    expires_at: i64,
) -> Result<()> {
    require_platform_active(&ctx.accounts.platform_config)?;
    require_check_in_open(&ctx.accounts.event)?;
    require_active_ticket(&ctx.accounts.ticket_record)?;
    require_keys_eq!(
        ctx.accounts.ticket_record.owner,
        ctx.accounts.holder.key(),
        TicketingError::NotTicketOwner
    );
    require!(
        intent_nonce == ctx.accounts.ticket_record.next_intent_nonce,
        TicketingError::InvalidSequence
    );
    require!(
        ctx.accounts.ticket_record.active_intent.is_none(),
        TicketingError::IntentNotPending
    );
    verify_managed_asset(
        ctx.accounts.managed_asset.key(),
        &ctx.accounts.managed_asset,
        ctx.accounts.ticket_record.key(),
        &ctx.accounts.ticket_record,
        ctx.accounts.asset_authority.key(),
    )?;

    let now = Clock::get()?.unix_timestamp;
    validate_intent_expiry(now, expires_at, ctx.accounts.event.check_in_end_at)?;
    let ticket_key = ctx.accounts.ticket_record.key();
    let event_key = ctx.accounts.event.key();
    let intent_key = ctx.accounts.check_in_intent.key();
    let intent = &mut ctx.accounts.check_in_intent;
    intent.ticket = ticket_key;
    intent.event = event_key;
    intent.holder = ctx.accounts.holder.key();
    intent.nonce = intent_nonce;
    intent.expires_at = expires_at;
    intent.status = CheckInIntentStatus::Pending;
    intent.created_at = now;
    intent.consumed_at = None;
    intent.staff = None;
    intent.bump = ctx.bumps.check_in_intent;
    ctx.accounts.ticket_record.next_intent_nonce = ctx
        .accounts
        .ticket_record
        .next_intent_nonce
        .checked_add(1)
        .ok_or(TicketingError::ArithmeticOverflow)?;
    ctx.accounts.ticket_record.active_intent = Some(intent_key);
    Ok(())
}

pub fn present_check_in_core(
    ctx: Context<PresentCheckInCore>,
    intent_nonce: u64,
    expires_at: i64,
) -> Result<()> {
    require_platform_active(&ctx.accounts.platform_config)?;
    require_check_in_open(&ctx.accounts.event)?;
    require_active_ticket(&ctx.accounts.ticket_record)?;
    require_keys_eq!(
        ctx.accounts.ticket_record.owner,
        ctx.accounts.holder.key(),
        TicketingError::NotTicketOwner
    );
    require!(
        intent_nonce == ctx.accounts.ticket_record.next_intent_nonce,
        TicketingError::InvalidSequence
    );
    require!(
        ctx.accounts.ticket_record.active_intent.is_none(),
        TicketingError::IntentNotPending
    );
    verify_core_asset(
        &ctx.accounts.core_asset.to_account_info(),
        &ctx.accounts.ticket_record,
        ctx.accounts.holder.key(),
        ctx.accounts.asset_authority.key(),
    )?;

    let now = Clock::get()?.unix_timestamp;
    validate_intent_expiry(now, expires_at, ctx.accounts.event.check_in_end_at)?;
    let ticket_key = ctx.accounts.ticket_record.key();
    let event_key = ctx.accounts.event.key();
    let intent_key = ctx.accounts.check_in_intent.key();
    let intent = &mut ctx.accounts.check_in_intent;
    intent.ticket = ticket_key;
    intent.event = event_key;
    intent.holder = ctx.accounts.holder.key();
    intent.nonce = intent_nonce;
    intent.expires_at = expires_at;
    intent.status = CheckInIntentStatus::Pending;
    intent.created_at = now;
    intent.consumed_at = None;
    intent.staff = None;
    intent.bump = ctx.bumps.check_in_intent;
    ctx.accounts.ticket_record.next_intent_nonce = ctx
        .accounts
        .ticket_record
        .next_intent_nonce
        .checked_add(1)
        .ok_or(TicketingError::ArithmeticOverflow)?;
    ctx.accounts.ticket_record.active_intent = Some(intent_key);
    Ok(())
}

pub fn cancel_check_in(ctx: Context<CancelCheckIn>) -> Result<()> {
    require!(
        ctx.accounts.check_in_intent.status == CheckInIntentStatus::Pending,
        TicketingError::IntentNotPending
    );
    require_keys_eq!(
        ctx.accounts.check_in_intent.holder,
        ctx.accounts.holder.key(),
        TicketingError::NotTicketOwner
    );
    require!(
        ctx.accounts.ticket_record.active_intent == Some(ctx.accounts.check_in_intent.key()),
        TicketingError::InvalidRelationship
    );
    ctx.accounts.check_in_intent.status = CheckInIntentStatus::Cancelled;
    ctx.accounts.ticket_record.active_intent = None;
    Ok(())
}

pub fn expire_check_in(ctx: Context<ExpireCheckIn>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let intent_key = ctx.accounts.check_in_intent.key();
    expire_state(
        &mut ctx.accounts.ticket_record,
        intent_key,
        &mut ctx.accounts.check_in_intent,
        now,
    )
}

pub fn consume_check_in(ctx: Context<ConsumeCheckIn>) -> Result<()> {
    require_platform_active(&ctx.accounts.platform_config)?;
    require_check_in_open(&ctx.accounts.event)?;
    require!(
        ctx.accounts.staff_authorization.active,
        TicketingError::StaffNotAuthorized
    );
    let now = Clock::get()?.unix_timestamp;
    require!(
        now < ctx.accounts.check_in_intent.expires_at,
        TicketingError::IntentExpired
    );
    require_keys_eq!(
        ctx.accounts.check_in_intent.holder,
        ctx.accounts.ticket_record.owner,
        TicketingError::AssetOwnerMismatch
    );
    verify_managed_asset(
        ctx.accounts.managed_asset.key(),
        &ctx.accounts.managed_asset,
        ctx.accounts.ticket_record.key(),
        &ctx.accounts.ticket_record,
        ctx.accounts.asset_authority.key(),
    )?;

    let event_key = ctx.accounts.event.key();
    let ticket_key = ctx.accounts.ticket_record.key();
    let intent_key = ctx.accounts.check_in_intent.key();
    let holder = ctx.accounts.ticket_record.owner;
    let staff = ctx.accounts.staff.key();
    consume_state(
        &mut ctx.accounts.ticket_record,
        intent_key,
        &mut ctx.accounts.check_in_intent,
        staff,
        now,
    )?;
    emit!(CheckInConsumed {
        event: event_key,
        ticket: ticket_key,
        holder,
        staff,
        consumed_at: now,
    });
    Ok(())
}

pub fn consume_check_in_core(ctx: Context<ConsumeCheckInCore>) -> Result<()> {
    require_platform_active(&ctx.accounts.platform_config)?;
    require_check_in_open(&ctx.accounts.event)?;
    require!(
        ctx.accounts.staff_authorization.active,
        TicketingError::StaffNotAuthorized
    );
    let now = Clock::get()?.unix_timestamp;
    require!(
        now < ctx.accounts.check_in_intent.expires_at,
        TicketingError::IntentExpired
    );
    require_keys_eq!(
        ctx.accounts.check_in_intent.holder,
        ctx.accounts.ticket_record.owner,
        TicketingError::AssetOwnerMismatch
    );
    verify_core_asset(
        &ctx.accounts.core_asset.to_account_info(),
        &ctx.accounts.ticket_record,
        ctx.accounts.ticket_record.owner,
        ctx.accounts.asset_authority.key(),
    )?;
    require!(
        ctx.accounts.check_in_intent.status == CheckInIntentStatus::Pending,
        TicketingError::IntentNotPending
    );
    require!(
        ctx.accounts.ticket_record.active_intent == Some(ctx.accounts.check_in_intent.key()),
        TicketingError::InvalidRelationship
    );

    ctx.accounts.check_in_intent.status = CheckInIntentStatus::Consumed;
    ctx.accounts.check_in_intent.consumed_at = Some(now);
    ctx.accounts.check_in_intent.staff = Some(ctx.accounts.staff.key());
    ctx.accounts.ticket_record.status = TicketStatus::Used;
    ctx.accounts.ticket_record.used_at = Some(now);
    ctx.accounts.ticket_record.used_by = Some(ctx.accounts.staff.key());
    ctx.accounts.ticket_record.active_intent = None;

    emit!(CheckInConsumed {
        event: ctx.accounts.event.key(),
        ticket: ctx.accounts.ticket_record.key(),
        holder: ctx.accounts.ticket_record.owner,
        staff: ctx.accounts.staff.key(),
        consumed_at: now,
    });
    Ok(())
}

fn consume_state(
    ticket: &mut TicketRecord,
    intent_key: Pubkey,
    intent: &mut CheckInIntent,
    staff: Pubkey,
    now: i64,
) -> Result<()> {
    require!(
        intent.status == CheckInIntentStatus::Pending,
        TicketingError::IntentNotPending
    );
    require!(
        ticket.active_intent == Some(intent_key),
        TicketingError::InvalidRelationship
    );
    require_active_ticket(ticket)?;
    ticket.status = TicketStatus::Used;
    ticket.used_at = Some(now);
    ticket.used_by = Some(staff);
    ticket.active_intent = None;
    intent.status = CheckInIntentStatus::Consumed;
    intent.consumed_at = Some(now);
    intent.staff = Some(staff);
    Ok(())
}

fn expire_state(
    ticket: &mut TicketRecord,
    intent_key: Pubkey,
    intent: &mut CheckInIntent,
    now: i64,
) -> Result<()> {
    require!(
        intent.status == CheckInIntentStatus::Pending,
        TicketingError::IntentNotPending
    );
    require!(now >= intent.expires_at, TicketingError::IntentNotExpired);
    require!(
        ticket.active_intent == Some(intent_key),
        TicketingError::InvalidRelationship
    );
    intent.status = CheckInIntentStatus::Expired;
    ticket.active_intent = None;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::{AssetStandard, CheckInIntentStatus};

    fn ticket(owner: Pubkey) -> TicketRecord {
        TicketRecord {
            event: Pubkey::new_unique(),
            tier: Pubkey::new_unique(),
            serial: 0,
            asset_id: Pubkey::new_unique(),
            asset_standard: AssetStandard::Managed,
            owner,
            original_price_lamports: 1_000,
            status: TicketStatus::Active,
            transfer_count: 0,
            used_at: None,
            used_by: None,
            next_listing_id: 0,
            next_intent_nonce: 1,
            active_intent: None,
            bump: 0,
            created_at: 0,
        }
    }

    fn intent(ticket: Pubkey, holder: Pubkey) -> CheckInIntent {
        CheckInIntent {
            ticket,
            event: Pubkey::new_unique(),
            holder,
            nonce: 0,
            expires_at: 300,
            status: CheckInIntentStatus::Pending,
            created_at: 0,
            consumed_at: None,
            staff: None,
            bump: 0,
        }
    }

    #[test]
    fn consumption_marks_ticket_and_intent_once() {
        let holder = Pubkey::new_unique();
        let staff = Pubkey::new_unique();
        let ticket_key = Pubkey::new_unique();
        let mut ticket = ticket(holder);
        let mut intent = intent(ticket_key, holder);
        ticket.active_intent = Some(ticket_key);

        consume_state(&mut ticket, ticket_key, &mut intent, staff, 100).unwrap();
        assert_eq!(ticket.status, TicketStatus::Used);
        assert_eq!(ticket.used_at, Some(100));
        assert_eq!(ticket.used_by, Some(staff));
        assert_eq!(intent.status, CheckInIntentStatus::Consumed);
        assert_eq!(intent.consumed_at, Some(100));
        assert_eq!(intent.staff, Some(staff));

        assert!(consume_state(&mut ticket, ticket_key, &mut intent, staff, 101).is_err());
        assert_eq!(ticket.used_at, Some(100));
    }

    #[test]
    fn cancelled_intent_cannot_be_consumed() {
        let holder = Pubkey::new_unique();
        let mut ticket = ticket(holder);
        let ticket_key = Pubkey::new_unique();
        let mut intent = intent(ticket_key, holder);
        ticket.active_intent = Some(ticket_key);
        intent.status = CheckInIntentStatus::Cancelled;
        assert!(consume_state(
            &mut ticket,
            ticket_key,
            &mut intent,
            Pubkey::new_unique(),
            100
        )
        .is_err());
        assert_eq!(ticket.status, TicketStatus::Active);
    }

    #[test]
    fn previously_used_ticket_cannot_be_consumed_with_a_new_intent() {
        let holder = Pubkey::new_unique();
        let mut ticket = ticket(holder);
        ticket.status = TicketStatus::Used;
        ticket.used_at = Some(90);
        let ticket_key = Pubkey::new_unique();
        let mut intent = intent(ticket_key, holder);
        ticket.active_intent = Some(ticket_key);
        assert!(consume_state(
            &mut ticket,
            ticket_key,
            &mut intent,
            Pubkey::new_unique(),
            100
        )
        .is_err());
        assert_eq!(intent.status, CheckInIntentStatus::Pending);
    }

    #[test]
    fn expiring_an_intent_unblocks_the_next_presentation() {
        let holder = Pubkey::new_unique();
        let intent_key = Pubkey::new_unique();
        let mut ticket = ticket(holder);
        let mut intent = intent(intent_key, holder);
        ticket.active_intent = Some(intent_key);

        assert!(expire_state(&mut ticket, intent_key, &mut intent, 299).is_err());
        assert_eq!(ticket.active_intent, Some(intent_key));

        expire_state(&mut ticket, intent_key, &mut intent, 300).unwrap();
        assert_eq!(intent.status, CheckInIntentStatus::Expired);
        assert_eq!(ticket.active_intent, None);
    }
}
