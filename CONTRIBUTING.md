# Contributing

Centlalia is being built as a devnet MVP. Changes should preserve the smallest verifiable event flow: publish, acquire, present and consume access exactly once.

## Development

1. Open the repository in its devcontainer or GitHub Codespaces.
2. Copy `.env.example` to `.env.local` and add only development credentials.
3. Run `pnpm install` and `pnpm dev` for the web application.
4. Run `cargo test --workspace` for program-domain tests.
5. Run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` before opening a pull request.

Keep pull requests scoped to one outcome. Never commit wallets, private keys, DAS credentials, participant identities or real-value payment data.

## Product evidence

Validation results must distinguish observations from interpretations. Use anonymous participant identifiers and record failed tasks and contradictory feedback, not only successful outcomes.
