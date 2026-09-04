"""
Flint Scout Agent (Freelancer / Builder Representative)
Analyzes verified GitHub telemetry, calculates skill vectors, and autonomously drafts bids.
"""

from dataclasses import dataclass
from typing import List, Dict, Any


@dataclass
class BuilderProfile:
    handle: str
    wallet_address: str
    sbt_reliability_score: int
    primary_skills: List[str]
    total_completed_gigs: int
    github_verified: bool
    wallet_age_days: int
    onchain_protocol_interactions: List[str]
    linkedin_verified: bool
    linkedin_experience_years: int


class ScoutAgent:
    def __init__(self, builder: BuilderProfile):
        self.builder = builder

    def evaluate_gig_fit(self, gig: Dict[str, Any]) -> float:
        """
        Computes relevance score between builder profile and gig requirements (0.0 to 1.0).
        """
        required_skills = gig.get("required_skills", [])
        if not required_skills:
            return 0.5

        matched = [s for s in required_skills if s.lower() in [b.lower() for b in self.builder.primary_skills]]
        skill_score = len(matched) / len(required_skills)
        reliability_multiplier = self.builder.sbt_reliability_score / 100.0

        # Identity Oracles (LinkedIn + Wallet History)
        identity_bonus = 0.0
        if self.builder.linkedin_verified:
            identity_bonus += 0.05 + (min(self.builder.linkedin_experience_years, 10) * 0.01)
        if self.builder.wallet_age_days > 365:
            identity_bonus += 0.05
        if len(self.builder.onchain_protocol_interactions) > 5:
            identity_bonus += 0.05

        fit = (skill_score * 0.6) + (reliability_multiplier * 0.3) + min(identity_bonus, 0.2)
        return round(fit, 3)

    def generate_blind_proposal(self, gig: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates structured proposal ready for encryption into MagicBlock Private Ephemeral Rollup.
        """
        fit = self.evaluate_gig_fit(gig)
        suggested_quote = int(gig.get("budget_sol", 1.0) * 0.95 * 1e9)  # 5% competitive discount in lamports

        return {
            "builder_wallet": self.builder.wallet_address,
            "gig_id": gig.get("id"),
            "fit_score": fit,
            "bid_amount_lamports": suggested_quote,
            "proposal_text": (
                f"I specialize in {', '.join(self.builder.primary_skills[:3])} with an on-chain "
                f"reputation score of {self.builder.sbt_reliability_score}/100 across {self.builder.total_completed_gigs} gigs. "
                f"I will deliver each milestone via MagicBlock Ephemeral Rollups for instant verification."
            ),
            "self_stake_yes_shares": 50_000_000,  # 0.05 SOL performance self-stake
            "privacy_mode": "INTEL_TDX_TEE_ENCRYPTED"
        }
