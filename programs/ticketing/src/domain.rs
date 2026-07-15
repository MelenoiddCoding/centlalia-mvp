use anchor_lang::prelude::*;

use crate::{
    errors::TicketingError,
    state::{
        EventDetails, EventStatus, BPS_DENOMINATOR, MAX_CHECK_IN_INTENT_SECONDS,
        MAX_EVENT_TITLE_LEN, MAX_METADATA_URI_LEN, MAX_TIER_NAME_LEN,
    },
};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct ResaleSplit {
    pub seller_lamports: u64,
    pub organizer_lamports: u64,
    pub platform_lamports: u64,
}

pub fn validate_bps(value: u16) -> Result<()> {
    require!(
        u64::from(value) <= BPS_DENOMINATOR,
        TicketingError::InvalidBasisPoints
    );
    Ok(())
}

pub fn validate_fee_configuration(platform_fee_bps: u16, royalty_bps: u16) -> Result<()> {
    validate_bps(platform_fee_bps)?;
    validate_bps(royalty_bps)?;
    let total = u32::from(platform_fee_bps)
        .checked_add(u32::from(royalty_bps))
        .ok_or(TicketingError::ArithmeticOverflow)?;
    require!(total <= 10_000, TicketingError::InvalidFeeConfiguration);
    Ok(())
}

pub fn validate_event_details(details: &EventDetails, platform_fee_bps: u16) -> Result<()> {
    let title_len = details.title.trim().len();
    require!(
        title_len > 0 && title_len <= MAX_EVENT_TITLE_LEN,
        TicketingError::InvalidEventTitle
    );
    require!(
        details.metadata_uri.len() <= MAX_METADATA_URI_LEN,
        TicketingError::InvalidMetadataUri
    );
    require!(
        details.sales_start_at < details.sales_end_at
            && details.sales_end_at <= details.starts_at
            && details.starts_at < details.ends_at
            && details.check_in_start_at <= details.starts_at
            && details.check_in_start_at < details.check_in_end_at
            && details.check_in_end_at <= details.ends_at,
        TicketingError::InvalidEventWindows
    );
    validate_bps(details.max_resale_markup_bps)?;
    validate_fee_configuration(platform_fee_bps, details.organizer_royalty_bps)
}

pub fn validate_tier(name: &str, supply: u32) -> Result<()> {
    let name_len = name.trim().len();
    require!(
        name_len > 0 && name_len <= MAX_TIER_NAME_LEN,
        TicketingError::InvalidTierName
    );
    require!(supply > 0, TicketingError::InvalidTierSupply);
    Ok(())
}

pub fn validate_event_cancellation(status: EventStatus, issued_tickets: u64) -> Result<()> {
    require!(
        status == EventStatus::Draft || issued_tickets == 0,
        TicketingError::EventHasTickets
    );
    Ok(())
}

pub fn fee_amount(amount: u64, fee_bps: u16) -> Result<u64> {
    amount
        .checked_mul(u64::from(fee_bps))
        .ok_or(TicketingError::ArithmeticOverflow)?
        .checked_div(BPS_DENOMINATOR)
        .ok_or_else(|| TicketingError::ArithmeticOverflow.into())
}

pub fn primary_split(price: u64, platform_fee_bps: u16) -> Result<(u64, u64)> {
    validate_bps(platform_fee_bps)?;
    let platform = fee_amount(price, platform_fee_bps)?;
    let organizer = price
        .checked_sub(platform)
        .ok_or(TicketingError::ArithmeticOverflow)?;
    Ok((organizer, platform))
}

pub fn resale_split(
    price: u64,
    platform_fee_bps: u16,
    organizer_royalty_bps: u16,
) -> Result<ResaleSplit> {
    validate_fee_configuration(platform_fee_bps, organizer_royalty_bps)?;
    let platform_lamports = fee_amount(price, platform_fee_bps)?;
    let organizer_lamports = fee_amount(price, organizer_royalty_bps)?;
    let seller_lamports = price
        .checked_sub(platform_lamports)
        .and_then(|value| value.checked_sub(organizer_lamports))
        .ok_or(TicketingError::ArithmeticOverflow)?;
    Ok(ResaleSplit {
        seller_lamports,
        organizer_lamports,
        platform_lamports,
    })
}

pub fn max_resale_price(original_price: u64, markup_bps: u16) -> Result<u64> {
    validate_bps(markup_bps)?;
    let markup = fee_amount(original_price, markup_bps)?;
    original_price
        .checked_add(markup)
        .ok_or_else(|| TicketingError::ArithmeticOverflow.into())
}

pub fn validate_intent_expiry(now: i64, expires_at: i64, check_in_end_at: i64) -> Result<()> {
    let maximum_expiry = now
        .checked_add(MAX_CHECK_IN_INTENT_SECONDS)
        .ok_or(TicketingError::ArithmeticOverflow)?;
    require!(
        expires_at > now && expires_at <= maximum_expiry && expires_at <= check_in_end_at,
        TicketingError::InvalidIntentExpiry
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn details() -> EventDetails {
        EventDetails {
            title: "Solana Builders Meetup".into(),
            metadata_uri: "https://example.com/event.json".into(),
            sales_start_at: 100,
            sales_end_at: 200,
            starts_at: 300,
            ends_at: 500,
            check_in_start_at: 250,
            check_in_end_at: 450,
            max_resale_markup_bps: 2_000,
            organizer_royalty_bps: 500,
            resale_enabled: true,
        }
    }

    #[test]
    fn accepts_valid_event_details() {
        assert!(validate_event_details(&details(), 0).is_ok());
        assert!(validate_event_details(&details(), 200).is_ok());
    }

    #[test]
    fn rejects_blank_and_oversized_titles() {
        let mut value = details();
        value.title = "   ".into();
        assert!(validate_event_details(&value, 0).is_err());
        value.title = "x".repeat(MAX_EVENT_TITLE_LEN + 1);
        assert!(validate_event_details(&value, 0).is_err());
    }

    #[test]
    fn rejects_oversized_metadata_uri() {
        let mut value = details();
        value.metadata_uri = "x".repeat(MAX_METADATA_URI_LEN + 1);
        assert!(validate_event_details(&value, 0).is_err());
    }

    #[test]
    fn rejects_overlapping_sales_and_event_windows() {
        let mut value = details();
        value.sales_end_at = value.starts_at + 1;
        assert!(validate_event_details(&value, 0).is_err());
    }

    #[test]
    fn rejects_check_in_outside_event_window() {
        let mut value = details();
        value.check_in_end_at = value.ends_at + 1;
        assert!(validate_event_details(&value, 0).is_err());
    }

    #[test]
    fn rejects_combined_fees_above_one_hundred_percent() {
        assert!(validate_fee_configuration(5_001, 5_000).is_err());
        assert!(validate_fee_configuration(5_000, 5_000).is_ok());
    }

    #[test]
    fn calculates_primary_split_without_losing_lamports() {
        let (organizer, platform) = primary_split(1_000_003, 200).unwrap();
        assert_eq!(platform, 20_000);
        assert_eq!(organizer + platform, 1_000_003);
    }

    #[test]
    fn calculates_resale_split_without_losing_lamports() {
        let split = resale_split(1_000_003, 200, 500).unwrap();
        assert_eq!(split.platform_lamports, 20_000);
        assert_eq!(split.organizer_lamports, 50_000);
        assert_eq!(
            split.seller_lamports + split.organizer_lamports + split.platform_lamports,
            1_000_003
        );
    }

    #[test]
    fn supports_zero_platform_fee_for_incubation() {
        let split = resale_split(1_000, 0, 500).unwrap();
        assert_eq!(split.platform_lamports, 0);
        assert_eq!(split.organizer_lamports, 50);
        assert_eq!(split.seller_lamports, 950);
    }

    #[test]
    fn calculates_resale_cap_independently_from_royalty() {
        assert_eq!(max_resale_price(1_000, 2_000).unwrap(), 1_200);
    }

    #[test]
    fn rejects_basis_points_above_limit() {
        assert!(validate_bps(10_001).is_err());
        assert!(max_resale_price(1_000, 10_001).is_err());
    }

    #[test]
    fn detects_price_overflow() {
        assert!(max_resale_price(u64::MAX, 10_000).is_err());
    }

    #[test]
    fn validates_tier_name_and_supply() {
        assert!(validate_tier("General", 1).is_ok());
        assert!(validate_tier("", 1).is_err());
        assert!(validate_tier("General", 0).is_err());
        assert!(validate_tier(&"x".repeat(MAX_TIER_NAME_LEN + 1), 1).is_err());
    }

    #[test]
    fn prevents_cancelling_a_published_event_with_issued_tickets() {
        assert!(validate_event_cancellation(EventStatus::Draft, 2).is_ok());
        assert!(validate_event_cancellation(EventStatus::Published, 0).is_ok());
        assert!(validate_event_cancellation(EventStatus::Published, 1).is_err());
    }

    #[test]
    fn intent_expiry_is_short_lived_and_inside_check_in_window() {
        assert!(validate_intent_expiry(1_000, 1_300, 2_000).is_ok());
        assert!(validate_intent_expiry(1_000, 1_301, 2_000).is_err());
        assert!(validate_intent_expiry(1_000, 1_100, 1_099).is_err());
        assert!(validate_intent_expiry(1_000, 1_000, 2_000).is_err());
    }
}
