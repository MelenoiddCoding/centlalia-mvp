FROM mcr.microsoft.com/devcontainers/rust:1-1-bookworm

ARG SOLANA_VERSION=v4.1.2
ARG ANCHOR_VERSION=1.1.2
ARG RUST_VERSION=1.91.0

RUN apt-get update \
    && apt-get install -y --no-install-recommends clang cmake libudev-dev libssl-dev pkg-config protobuf-compiler \
    && rm -rf /var/lib/apt/lists/*

USER vscode
ENV PATH="/home/vscode/.local/share/solana/install/active_release/bin:/home/vscode/.cargo/bin:${PATH}"

RUN rustup toolchain install "${RUST_VERSION}" --profile minimal --component clippy,rustfmt \
    && rustup default "${RUST_VERSION}" \
    && curl --proto '=https' --tlsv1.2 -sSfL "https://release.anza.xyz/${SOLANA_VERSION}/install" | sh \
    && cargo install anchor-cli --version "${ANCHOR_VERSION}" --locked
