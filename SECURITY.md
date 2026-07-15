# Security policy

Centlalia currently targets Solana devnet and controlled demonstrations. It has not been audited and must not custody assets or process payments with real-world value.

## Reporting

Do not open a public issue for a vulnerability involving authorization, ticket ownership, check-in replay, payment distribution or credentials. Contact the maintainers privately through the security reporting channel configured on GitHub.

## Required controls

- A ticket owner must sign the presentation intent used for check-in.
- Only active event staff may consume an unexpired intent.
- Asset ownership and `TicketRecord` ownership must never be updated independently.
- Platform fee, organizer royalty and resale markup are independent basis-point fields.
- `DAS_RPC_URL`, wallet keypairs and deployer credentials stay outside browser bundles and Git history.
- Mainnet deployment requires an external program review and a separate launch decision.
