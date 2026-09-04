"""
Example Strategy: Git Velocity & Reputation Arbitrage
Inspired by noncausal.ai Python strategy scripts.

Hypothesis:
Market pricing of milestone completion often lags real-time GitHub commit velocity.
When a high-reputation builder (SBT > 85) exhibits recent commit activity (>= 4 in 48h)
and market odds are underpriced (< 0.70), buy YES.
Conversely, if commits stall (< 2) with less than 24h remaining, buy NO to hedge.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from flint_quant.strategy import FlintStrategy, TelemetryData, OrderSignal, OrderAction
from flint_quant.backtester import MilestoneBacktester


class GitVelocityArbitrageStrategy(FlintStrategy):

    def evaluate_telemetry(self, telemetry: TelemetryData) -> OrderSignal:
        stake_size = 100_000_000  # 0.1 SOL

        # Condition 1: High conviction delivery (Underpriced YES)
        # Now enhanced with Identity Oracles (LinkedIn/Wallet)
        has_strong_identity = (
            telemetry.linkedin_verified and 
            telemetry.wallet_age_days > 180 and 
            telemetry.onchain_protocol_interactions > 2
        )

        if (
            telemetry.sbt_reliability_score >= 85.0
            and telemetry.git_commits_last_48h >= 4
            and telemetry.current_yes_price <= 0.65
            and has_strong_identity
        ):
            return self.buy_yes(
                market_id=telemetry.milestone_id,
                size_lamports=stake_size,
                limit_price=0.68,
                rationale=(
                    f"Strong commit velocity ({telemetry.git_commits_last_48h} in 48h), "
                    f"verified LinkedIn, {telemetry.wallet_age_days}d wallet age "
                    f"with high SBT ({telemetry.sbt_reliability_score}) priced at only {telemetry.current_yes_price}"
                )
            )

        # Condition 2: High risk of delay (Underpriced NO)
        if (
            telemetry.git_commits_last_48h <= 1
            and telemetry.hours_remaining <= 24.0
            and telemetry.current_no_price <= 0.50
        ):
            return self.buy_no(
                market_id=telemetry.milestone_id,
                size_lamports=stake_size,
                limit_price=0.55,
                rationale=(
                    f"Stalled commit activity with only {telemetry.hours_remaining}h left. "
                    f"NO underpriced at {telemetry.current_no_price}"
                )
            )

        return OrderSignal(market_id=telemetry.milestone_id, action=OrderAction.HOLD, size_lamports=0, limit_price=0.0)


if __name__ == "__main__":
    strategy = GitVelocityArbitrageStrategy(name="GitVelocityArb_v1")
    backtester = MilestoneBacktester(initial_capital_lamports=5_000_000_000)  # 5 SOL
    backtester.run(strategy)
