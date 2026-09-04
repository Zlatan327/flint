#!/bin/bash
set -e

echo "⬇️ Using Rust 1.84.1 to generate a lockfile safely..."
# We use 1.84.1 because it is new enough to not crash on "edition=2024" crates,
# but old enough to generate a v3 Cargo.lock that your Solana compiler can read.
rustup install 1.84.1
rustup default 1.84.1

echo "🧹 Clearing Cargo cache..."
rm -rf ~/.cargo/registry/index/* ~/.cargo/registry/cache/* ~/.cargo/registry/src/*

echo "🔄 Generating new Cargo.lock..."
# By deleting the v4 lockfile, Rust 1.84.1 will generate a fresh v3 lockfile.
# Because of rust-version="1.75" in Cargo.toml, it will automatically downgrade
# all dependencies to avoid the broken 2024 crates! No manual downgrades needed!
rm -f Cargo.lock
cargo generate-lockfile

echo "🚀 Running anchor build..."
anchor build
