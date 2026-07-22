use anchor_lang::prelude::*;
use mpl_core::{
    accounts::BaseAssetV1,
    instructions::CreateV2CpiBuilder,
    types::{
        PermanentFreezeDelegate, Plugin, PluginAuthority, PluginAuthorityPair, UpdateAuthority,
    },
};

use crate::{
    errors::TicketingError,
    state::{AssetStandard, ManagedAsset, TicketRecord},
};

pub fn require_supported_standard(standard: AssetStandard) -> Result<()> {
    require!(
        matches!(standard, AssetStandard::Managed | AssetStandard::MplCore),
        TicketingError::UnsupportedAssetStandard
    );
    Ok(())
}

pub fn require_managed_standard(standard: AssetStandard) -> Result<()> {
    require!(
        standard == AssetStandard::Managed,
        TicketingError::UnsupportedAssetStandard
    );
    Ok(())
}

pub fn require_core_standard(standard: AssetStandard) -> Result<()> {
    require!(
        standard == AssetStandard::MplCore,
        TicketingError::UnsupportedAssetStandard
    );
    Ok(())
}

pub fn verify_managed_asset(
    asset_key: Pubkey,
    asset: &ManagedAsset,
    ticket_key: Pubkey,
    ticket: &TicketRecord,
    expected_authority: Pubkey,
) -> Result<()> {
    require_managed_standard(ticket.asset_standard)?;
    require_keys_eq!(ticket.asset_id, asset_key, TicketingError::InvalidAsset);
    require_keys_eq!(asset.ticket, ticket_key, TicketingError::InvalidAsset);
    require!(
        asset.standard == AssetStandard::Managed,
        TicketingError::InvalidAsset
    );
    require_keys_eq!(
        asset.authority,
        expected_authority,
        TicketingError::InvalidAssetAuthority
    );
    require_keys_eq!(
        asset.owner,
        ticket.owner,
        TicketingError::AssetOwnerMismatch
    );
    Ok(())
}

pub struct CreateCoreAsset<'a, 'info> {
    pub core_program: &'a AccountInfo<'info>,
    pub asset: &'a AccountInfo<'info>,
    pub asset_authority: &'a AccountInfo<'info>,
    pub payer: &'a AccountInfo<'info>,
    pub owner: &'a AccountInfo<'info>,
    pub system_program: &'a AccountInfo<'info>,
    pub name: String,
    pub uri: String,
}

pub fn create_core_asset(
    accounts: CreateCoreAsset<'_, '_>,
    asset_signer: &[&[u8]],
    authority_signer: &[&[u8]],
) -> Result<()> {
    let authority = *accounts.asset_authority.key;
    let plugins = vec![PluginAuthorityPair {
        plugin: Plugin::PermanentFreezeDelegate(PermanentFreezeDelegate { frozen: true }),
        authority: Some(PluginAuthority::Address { address: authority }),
    }];

    CreateV2CpiBuilder::new(accounts.core_program)
        .asset(accounts.asset)
        .authority(Some(accounts.asset_authority))
        .payer(accounts.payer)
        .owner(Some(accounts.owner))
        .update_authority(Some(accounts.asset_authority))
        .system_program(accounts.system_program)
        .name(accounts.name)
        .uri(accounts.uri)
        .plugins(plugins)
        .invoke_signed(&[asset_signer, authority_signer])?;
    Ok(())
}

pub fn verify_core_asset(
    asset: &AccountInfo<'_>,
    ticket: &TicketRecord,
    expected_owner: Pubkey,
    expected_authority: Pubkey,
) -> Result<()> {
    require_core_standard(ticket.asset_standard)?;
    require_keys_eq!(ticket.asset_id, *asset.key, TicketingError::InvalidAsset);
    require_keys_eq!(*asset.owner, mpl_core::ID, TicketingError::InvalidAsset);

    let data = asset
        .try_borrow_data()
        .map_err(|_| error!(TicketingError::InvalidAsset))?;
    let core_asset =
        BaseAssetV1::from_bytes(&data).map_err(|_| error!(TicketingError::InvalidAsset))?;
    require_keys_eq!(
        core_asset.owner,
        expected_owner,
        TicketingError::AssetOwnerMismatch
    );
    require!(
        core_asset.update_authority == UpdateAuthority::Address(expected_authority),
        TicketingError::InvalidAssetAuthority
    );
    Ok(())
}

/// Moves canonical ownership and its access record together. No instruction may
/// update `TicketRecord.owner` without passing through this boundary.
pub fn transfer_managed_asset(
    asset: &mut ManagedAsset,
    ticket: &mut TicketRecord,
    new_owner: Pubkey,
) -> Result<()> {
    require_keys_neq!(ticket.owner, new_owner, TicketingError::SameOwner);
    asset.owner = new_owner;
    ticket.owner = new_owner;
    ticket.transfer_count = ticket
        .transfer_count
        .checked_add(1)
        .ok_or(TicketingError::ArithmeticOverflow)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::TicketStatus;

    fn ticket(owner: Pubkey, asset_id: Pubkey) -> TicketRecord {
        TicketRecord {
            event: Pubkey::new_unique(),
            tier: Pubkey::new_unique(),
            serial: 0,
            asset_id,
            asset_standard: AssetStandard::Managed,
            owner,
            original_price_lamports: 1_000,
            status: TicketStatus::Active,
            transfer_count: 0,
            used_at: None,
            used_by: None,
            next_listing_id: 0,
            next_intent_nonce: 0,
            active_intent: None,
            bump: 0,
            created_at: 0,
        }
    }

    #[test]
    fn verifies_canonical_managed_asset() {
        let owner = Pubkey::new_unique();
        let authority = Pubkey::new_unique();
        let ticket_key = Pubkey::new_unique();
        let asset_key = Pubkey::new_unique();
        let ticket = ticket(owner, asset_key);
        let asset = ManagedAsset {
            authority,
            owner,
            ticket: ticket_key,
            standard: AssetStandard::Managed,
            bump: 0,
            created_at: 0,
        };
        assert!(verify_managed_asset(asset_key, &asset, ticket_key, &ticket, authority).is_ok());
    }

    #[test]
    fn rejects_divergent_asset_owner() {
        let owner = Pubkey::new_unique();
        let authority = Pubkey::new_unique();
        let ticket_key = Pubkey::new_unique();
        let asset_key = Pubkey::new_unique();
        let ticket = ticket(owner, asset_key);
        let asset = ManagedAsset {
            authority,
            owner: Pubkey::new_unique(),
            ticket: ticket_key,
            standard: AssetStandard::Managed,
            bump: 0,
            created_at: 0,
        };
        assert!(verify_managed_asset(asset_key, &asset, ticket_key, &ticket, authority).is_err());
    }

    #[test]
    fn transfer_changes_asset_and_ticket_atomically() {
        let owner = Pubkey::new_unique();
        let recipient = Pubkey::new_unique();
        let asset_key = Pubkey::new_unique();
        let mut ticket = ticket(owner, asset_key);
        let mut asset = ManagedAsset {
            authority: Pubkey::new_unique(),
            owner,
            ticket: Pubkey::new_unique(),
            standard: AssetStandard::Managed,
            bump: 0,
            created_at: 0,
        };
        transfer_managed_asset(&mut asset, &mut ticket, recipient).unwrap();
        assert_eq!(asset.owner, recipient);
        assert_eq!(ticket.owner, recipient);
        assert_eq!(ticket.transfer_count, 1);
    }

    #[test]
    fn transfer_rejects_same_owner() {
        let owner = Pubkey::new_unique();
        let asset_key = Pubkey::new_unique();
        let mut ticket = ticket(owner, asset_key);
        let mut asset = ManagedAsset {
            authority: Pubkey::new_unique(),
            owner,
            ticket: Pubkey::new_unique(),
            standard: AssetStandard::Managed,
            bump: 0,
            created_at: 0,
        };
        assert!(transfer_managed_asset(&mut asset, &mut ticket, owner).is_err());
    }

    #[test]
    fn only_standards_with_adapters_are_supported() {
        assert!(require_supported_standard(AssetStandard::BubblegumV2).is_err());
        assert!(require_supported_standard(AssetStandard::MplCore).is_ok());
        assert!(require_managed_standard(AssetStandard::MplCore).is_err());
        assert!(require_core_standard(AssetStandard::Managed).is_err());
    }
}
