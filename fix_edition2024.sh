#!/bin/bash
set -e

echo "⬆️ Updating host Rust to stable to fix registry parsing bug..."
rustup default stable
rustup update stable

echo "🧹 Clearing Cargo cache..."
rm -rf ~/.cargo/registry/index/* ~/.cargo/registry/cache/* ~/.cargo/registry/src/*

echo "⬇️ Resolving dependencies (automatically downgrading 2024 edition crates)..."
# Because we added rust-version="1.75" to Cargo.toml, the modern Cargo 
# will automatically avoid the broken 2024 edition crates.
cargo generate-lockfile

# Just in case, let's still force the downgrades if the automatic resolution missed any.
cargo update -p indexmap --precise 2.5.0 || true
cargo update -p zeroize_derive --precise 1.4.2 || true
cargo update -p toml_datetime --precise 0.6.8 || true
cargo update -p digest --precise 0.10.7 || true
cargo update -p block-buffer --precise 0.10.3 || true
cargo update -p winnow --precise 0.6.18 || true

echo "🚀 Running anchor build..."
anchor build
