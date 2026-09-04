import math
import random
from typing import List, Dict, Any
from .strategy import FlintStrategy, OrderAction, TelemetryData


class MilestoneBacktester:
    """
    Backtesting engine for Flint prediction strategies.
    Simulates milestone delivery lifecycles, git commit velocity, and market pricing.
    """

    def __init__(self, initial_capital_lamports: int = 5_000_000_000):
        self.initial_capital = initial_capital_lamports
        self.cash = initial_capital_lamports
        self.trade_log: List[Dict[str, Any]] = []

    def generate_synthetic_dataset(self, num_gigs: int = 50) -> List[Dict[str, Any]]:
        """
        Generates realistic synthetic gig milestone data with varying developer performance.
        """
        random.seed(42)
        dataset = []
        for i in range(1, num_gigs + 1):
            # Developer profile
            sbt_score = random.uniform(60.0, 98.0)
            is_high_performer = sbt_score > 85.0
            
            # Commits and velocity
            commits_48h = random.randint(3, 12) if is_high_performer else random.randint(0, 4)
            hours_remaining = random.uniform(6.0, 72.0)
            
            # True outcome probability
            true_prob_yes = min(0.95, max(0.10, (sbt_score / 100.0) * 0.7 + (commits_48h / 12.0) * 0.3))
            delivered_on_time = random.random() < true_prob_yes
            
            # Market initial pricing (often lagging real git velocity)
            market_yes_price = round(random.uniform(0.40, 0.65), 2)
            market_no_price = round(1.0 - market_yes_price, 2)
            
            telemetry = TelemetryData(
                gig_id=1000 + i,
                milestone_id=i,
                freelancer_pubkey=f"Freelancer{i:03d}...",
                sbt_reliability_score=round(sbt_score, 1),
                git_commits_last_48h=commits_48h,
                pr_comments_resolved=random.randint(1, 8),
                hours_remaining=round(hours_remaining, 1),
                current_yes_price=market_yes_price,
                current_no_price=market_no_price,
                is_private_er_active=True
            )
            dataset.append({
                "telemetry": telemetry,
                "outcome_yes": delivered_on_time
            })
        return dataset

    def run(self, strategy: FlintStrategy, dataset: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Executes strategy across all milestones in the dataset and computes quantitative metrics.
        """
        if dataset is None:
            dataset = self.generate_synthetic_dataset()

        wins = 0
        losses = 0
        total_staked = 0
        net_profit = 0

        print(f"\n==================================================================")
        print(f"  FLINT QUANT BACKTEST REPORT: {strategy.name}")
        print(f"  Initial Capital: {self.initial_capital / 1e9:.2f} SOL | Datapoints: {len(dataset)} gigs")
        print(f"==================================================================")

        for entry in dataset:
            telemetry: TelemetryData = entry["telemetry"]
            outcome_yes: bool = entry["outcome_yes"]

            signal = strategy.evaluate_telemetry(telemetry)
            if not signal or signal.action == OrderAction.HOLD:
                continue

            order_size = min(signal.size_lamports, self.cash)
            if order_size <= 0:
                continue

            self.cash -= order_size
            total_staked += order_size

            # Evaluate payout
            if signal.action == OrderAction.BUY_YES:
                price = telemetry.current_yes_price
                shares = order_size / price
                win = outcome_yes
                payout = shares if win else 0
            else:
                price = telemetry.current_no_price
                shares = order_size / price
                win = not outcome_yes
                payout = shares if win else 0

            pnl = payout - order_size
            self.cash += payout
            net_profit += pnl

            if win:
                wins += 1
            else:
                losses += 1

            self.trade_log.append({
                "market_id": telemetry.milestone_id,
                "action": signal.action.value,
                "price": price,
                "staked_sol": order_size / 1e9,
                "pnl_sol": pnl / 1e9,
                "win": win,
                "rationale": signal.rationale
            })

        total_trades = wins + losses
        win_rate = (wins / total_trades * 100) if total_trades > 0 else 0.0
        roi = (net_profit / self.initial_capital * 100) if self.initial_capital > 0 else 0.0

        results = {
            "strategy_name": strategy.name,
            "total_trades": total_trades,
            "wins": wins,
            "losses": losses,
            "win_rate_pct": round(win_rate, 2),
            "final_capital_sol": round(self.cash / 1e9, 4),
            "net_profit_sol": round(net_profit / 1e9, 4),
            "roi_pct": round(roi, 2),
            "total_staked_sol": round(total_staked / 1e9, 4)
        }

        print(f"Total Trades Executed: {total_trades}")
        print(f"Win Rate:              {win_rate:.2f}% ({wins}W / {losses}L)")
        print(f"Net Profit:            {results['net_profit_sol']:+.4f} SOL ({roi:+.2f}% ROI)")
        print(f"Final Capital:         {results['final_capital_sol']:.4f} SOL")
        print(f"==================================================================\n")

        return results
