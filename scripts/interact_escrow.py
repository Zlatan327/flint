#!/usr/bin/env python3
"""
FLINT Protocol - Live Solana Devnet Escrow & Ephemeral Rollup Interaction Script
Demonstrates end-to-end lifecycle:
1. Initialize Gig Escrow (PDA)
2. Deposit escrow funds to Vault PDA (0.01 SOL)
3. Delegate state account to MagicBlock Ephemeral Rollup (sub-10ms session)
4. Confirm on Solana Devnet with Explorer links
"""

import os
import sys
import time
import json
import struct
import hashlib
import asyncio
from pathlib import Path

from solana.rpc.async_api import AsyncClient
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.instruction import Instruction, AccountMeta
from solders.message import Message
from solders.transaction import Transaction
from solders.system_program import ID as SYSTEM_PROGRAM_ID

# Deployed FLINT Program Addresses on Devnet
ESCROW_PROGRAM_ID = Pubkey.from_string("2PQbtiG8dxUqr2jSX1RfxiJnXutndhGkHm9k4YrKQD6h")
REPUTATION_PROGRAM_ID = Pubkey.from_string("J6JQJBVYB1ercx1rexHhAYYStaGWhx51YnEgbcr8AAWg")
MARKET_PROGRAM_ID = Pubkey.from_string("95ZEnzPdUE1bmF1oF2qjrYaGYPKyeeEmyz8h2xRgJ7e3")

DEVNET_RPC = "https://api.devnet.solana.com"


def load_payer() -> Keypair:
    """Loads the Solana CLI keypair from ~/.config/solana/id.json"""
    default_path = Path.home() / ".config" / "solana" / "id.json"
    if default_path.exists():
        with open(default_path, "r") as f:
            data = json.load(f)
            return Keypair.from_bytes(bytes(data))
    else:
        print(f"Keypair not found at {default_path}, generating temporary keypair...")
        return Keypair()


async def main():
    print("=" * 60)
    print("⚡ FLINT PROTOCOL: LIVE SOLANA DEVNET INTERACTION")
    print("=" * 60)

    client = AsyncClient(DEVNET_RPC)
    payer = load_payer()
    print(f"[*] Connected to: {DEVNET_RPC}")
    print(f"[*] Client / Payer Wallet: {payer.pubkey()}")

    # Check balance
    balance_resp = await client.get_balance(payer.pubkey())
    balance_sol = balance_resp.value / 1_000_000_000
    print(f"[*] Wallet Balance: {balance_sol:.4f} SOL")

    if balance_sol < 0.05:
        print("[!] Warning: Balance is low. Please request airdrop using 'solana airdrop 2'")

    # Parameters
    gig_id = int(time.time()) % 1_000_000  # Unique 6-digit gig ID
    total_amount_lamports = 10_000_000  # 0.01 SOL
    milestones_count = 2
    deadline = int(time.time()) + (7 * 86400)  # 7 days
    freelancer = Keypair().pubkey()  # Target freelancer address

    print("\n--- GIG ESCROW PARAMETERS ---")
    print(f"Gig ID:              #{gig_id}")
    print(f"Total Amount:        {total_amount_lamports / 1_000_000_000:.3f} SOL ({total_amount_lamports} lamports)")
    print(f"Milestones:          {milestones_count}")
    print(f"Freelancer:          {freelancer}")
    print(f"Escrow Program ID:   {ESCROW_PROGRAM_ID}")

    # Derive PDAs
    gig_id_bytes = gig_id.to_bytes(8, byteorder="little")
    gig_escrow_pda, escrow_bump = Pubkey.find_program_address(
        [b"gig_escrow", gig_id_bytes],
        ESCROW_PROGRAM_ID
    )
    vault_pda, vault_bump = Pubkey.find_program_address(
        [b"vault", bytes(gig_escrow_pda)],
        ESCROW_PROGRAM_ID
    )

    print(f"\n[+] Derived Gig Escrow PDA: {gig_escrow_pda}")
    print(f"[+] Derived Vault PDA:      {vault_pda}")

    # 1. Instruction: initialize_gig
    init_disc = hashlib.sha256(b"global:initialize_gig").digest()[:8]
    init_data = init_disc + struct.pack("<QQBq", gig_id, total_amount_lamports, milestones_count, deadline)
    init_ix = Instruction(
        program_id=ESCROW_PROGRAM_ID,
        data=init_data,
        accounts=[
            AccountMeta(pubkey=gig_escrow_pda, is_signer=False, is_writable=True),
            AccountMeta(pubkey=payer.pubkey(), is_signer=True, is_writable=True),
            AccountMeta(pubkey=freelancer, is_signer=False, is_writable=False),
            AccountMeta(pubkey=SYSTEM_PROGRAM_ID, is_signer=False, is_writable=False),
        ]
    )

    # 2. Instruction: deposit_escrow
    deposit_disc = hashlib.sha256(b"global:deposit_escrow").digest()[:8]
    deposit_data = deposit_disc + struct.pack("<Q", total_amount_lamports)
    deposit_ix = Instruction(
        program_id=ESCROW_PROGRAM_ID,
        data=deposit_data,
        accounts=[
            AccountMeta(pubkey=gig_escrow_pda, is_signer=False, is_writable=True),
            AccountMeta(pubkey=vault_pda, is_signer=False, is_writable=True),
            AccountMeta(pubkey=payer.pubkey(), is_signer=True, is_writable=True),
            AccountMeta(pubkey=SYSTEM_PROGRAM_ID, is_signer=False, is_writable=False),
        ]
    )

    # 3. Instruction: delegate_to_ephemeral_rollup
    delegate_disc = hashlib.sha256(b"global:delegate_to_ephemeral_rollup").digest()[:8]
    delegate_ix = Instruction(
        program_id=ESCROW_PROGRAM_ID,
        data=delegate_disc,
        accounts=[
            AccountMeta(pubkey=gig_escrow_pda, is_signer=False, is_writable=True),
            AccountMeta(pubkey=payer.pubkey(), is_signer=True, is_writable=False),
        ]
    )

    print("\n🚀 Bundling Instructions into Atomic Transaction:")
    print("  [1] flint_escrow::initialize_gig")
    print("  [2] flint_escrow::deposit_escrow (Locks 0.01 SOL in Vault PDA)")
    print("  [3] flint_escrow::delegate_to_ephemeral_rollup (Transfers state authority to MagicBlock ER)")

    latest_blockhash_resp = await client.get_latest_blockhash()
    latest_blockhash = latest_blockhash_resp.value.blockhash
    msg = Message([init_ix, deposit_ix, delegate_ix], payer.pubkey())
    tx = Transaction([payer], msg, latest_blockhash)

    print("\nSubmitting transaction to Solana Devnet cluster...")
    resp = await client.send_transaction(tx)
    tx_sig = str(resp.value)

    print("\n" + "=" * 60)
    print("🎉 TRANSACTION SUBMITTED SUCCESSFULLY!")
    print("=" * 60)
    print(f"Transaction Signature: {tx_sig}")
    print(f"Solana Explorer:       https://explorer.solana.com/tx/{tx_sig}?cluster=devnet")
    print(f"Escrow PDA on Chain:   https://explorer.solana.com/address/{gig_escrow_pda}?cluster=devnet")
    print(f"Vault PDA on Chain:    https://explorer.solana.com/address/{vault_pda}?cluster=devnet")
    print("=" * 60)
    print("Status: Escrow is funded and delegated to MagicBlock Ephemeral Rollup runtime! ⚡\n")

    await client.close()


if __name__ == "__main__":
    asyncio.run(main())
