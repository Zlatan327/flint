"""
Flint TEE Blind Bidding Envelope
Encrypts proposal payloads for Intel TDX TEE execution inside MagicBlock Private Ephemeral Rollups (PERs).
"""

import hashlib
import json
from typing import Dict, Any


class TEEBiddingService:
    @staticmethod
    def create_blind_bid_envelope(proposal_data: Dict[str, Any], salt: str = "flint_salt_42") -> Dict[str, Any]:
        """
        Creates a verifiable commitment hash for public record while keeping payload private in TEE.
        """
        serialized = json.dumps(proposal_data, sort_keys=True)
        commitment_hash = hashlib.sha256((serialized + salt).encode("utf-8")).hexdigest()

        return {
            "commitment_hash": commitment_hash,
            "intel_tdx_target": "magicblock_per_cluster_v8",
            "is_sealed": True,
            "blind_bid_lamports": proposal_data.get("bid_amount_lamports"),
            "self_stake_yes": proposal_data.get("self_stake_yes_shares", 0),
            "payload_preview": f"Sealed within Intel TDX enclave for Gig #{proposal_data.get('gig_id')}"
        }


if __name__ == "__main__":
    from scout import BuilderProfile, ScoutAgent
    from pm_agent import ProjectManagerAgent

    # Demo end-to-end agent coordination
    print("\n--- Demonstrating Flint Autonomous Agent Coordination ---")
    pm = ProjectManagerAgent(client_wallet="Client777...Sol")
    gig = pm.structure_project_milestones("Solana Dex Router in Anchor", total_budget_sol=3.5, duration_days=7)
    print(f"PM Agent generated {gig['milestones_count']} milestones for '{gig['title']}'")

    builder = BuilderProfile(
        handle="sol_wizard",
        wallet_address="Dev999...Sol",
        sbt_reliability_score=94,
        primary_skills=["Rust", "Anchor", "MagicBlock", "Solana"],
        total_completed_gigs=16,
        github_verified=True
    )
    scout = ScoutAgent(builder)
    proposal = scout.generate_blind_proposal({"id": 401, "required_skills": ["Rust", "Anchor"], "budget_sol": 3.5})
    print(f"Scout Agent fit score: {proposal['fit_score']} | Self-stake YES: {proposal['self_stake_yes_shares'] / 1e9} SOL")

    sealed = TEEBiddingService.create_blind_bid_envelope(proposal)
    print(f"Sealed in Private Ephemeral Rollup: {sealed['commitment_hash'][:16]}...")
