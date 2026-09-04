"""
Flint Project Manager Agent (Client Representative)
Translates high-level project goals into actionable milestones, escrow breakdowns, and prediction criteria.
"""

from typing import Dict, Any, List


class ProjectManagerAgent:
    def __init__(self, client_wallet: str):
        self.client_wallet = client_wallet

    def structure_project_milestones(
        self,
        project_title: str,
        total_budget_sol: float,
        duration_days: int
    ) -> Dict[str, Any]:
        """
        Breaks down a client request into structured, verifiable escrow milestones.
        """
        budget_lamports = int(total_budget_sol * 1e9)
        m1_share = int(budget_lamports * 0.30)
        m2_share = int(budget_lamports * 0.40)
        m3_share = budget_lamports - m1_share - m2_share

        milestones: List[Dict[str, Any]] = [
            {
                "index": 0,
                "name": "Architecture Spec & Scaffold",
                "allocation_lamports": m1_share,
                "criteria": "GitHub repo created, CI setup, interfaces defined, initial test harness passes.",
                "days_offset": int(duration_days * 0.25)
            },
            {
                "index": 1,
                "name": "Core Program & Ephemeral Rollup Integration",
                "allocation_lamports": m2_share,
                "criteria": "Anchor program written, MagicBlock state delegation tested on Devnet, PR merged.",
                "days_offset": int(duration_days * 0.65)
            },
            {
                "index": 2,
                "name": "Verification, Security Audit & UI",
                "allocation_lamports": m3_share,
                "criteria": "End-to-end integration verified, test coverage >90%, production release tagged.",
                "days_offset": duration_days
            }
        ]

        return {
            "client": self.client_wallet,
            "title": project_title,
            "total_budget_lamports": budget_lamports,
            "milestones_count": len(milestones),
            "milestones": milestones,
            "prediction_market_auto_spawn": True
        }
