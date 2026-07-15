# Centlalia program tests

This workspace package is the entrypoint used by `Anchor.toml`. The invariant
suite lives beside the Rust domain code so it exercises the same arithmetic,
asset ownership, and check-in transitions used by the on-chain handlers.

Run it from the repository root:

```sh
pnpm --filter @centlalia/program-tests test:program
```

## Local-validator integration

`test:integration` is intended to be invoked by `anchor test`. It fails when
`ANCHOR_PROVIDER_URL`, `ANCHOR_WALLET`, an executable deployment, its
upgradeable ProgramData account, or a fresh test ledger are missing.

The fixture uses four distinct wallets:

- `admin`: loaded from `ANCHOR_WALLET` because it must be the deployed
  program's upgrade authority.
- `organizer`: creates the event and tier, publishes, and authorizes staff.
- `attendee`: purchases the managed ticket and signs its check-in intent.
- `staff`: consumes the intent.

It records every successful signature, decodes the final ticket and intent
accounts, and requires the second consumption to fail with
`IntentNotPending (6036)`.

```sh
pnpm --filter @centlalia/program-tests check:integration
anchor test
```

The integration flow intentionally stops at the validated check-in wedge.
Gift and resale require a future check-in window, while this test opens
check-in immediately to avoid clock sleeps and nondeterministic validator
warping. SBF build, deployment, and runtime execution are verified by
`anchor test` on Linux; Windows can still run `check:integration`.
