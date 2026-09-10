import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../sdk-python')))

from flint_quant.backtester import MilestoneBacktester
from flint_quant.strategy import FlintStrategy, OrderAction, OrderSignal, TelemetryData

class AlwaysYesStrategy(FlintStrategy):
    def evaluate_telemetry(self, telemetry: TelemetryData) -> OrderSignal:
        return self.buy_yes(telemetry.milestone_id, 1000000, 0.5)

def test_synthetic_dataset_generation():
    backtester = MilestoneBacktester()
    dataset = backtester.generate_synthetic_dataset(num_gigs=10)
    assert len(dataset) == 10
    for entry in dataset:
        assert "telemetry" in entry
        assert "outcome_yes" in entry
        telemetry = entry["telemetry"]
        assert isinstance(telemetry, TelemetryData)
        assert telemetry.gig_id > 1000
        assert telemetry.linkedin_verified in [True, False]
        assert telemetry.wallet_age_days >= 30

def test_backtest_execution():
    backtester = MilestoneBacktester(initial_capital_lamports=5_000_000_000)
    strategy = AlwaysYesStrategy("Always Yes")
    results = backtester.run(strategy)
    
    assert "win_rate_pct" in results
    assert "roi_pct" in results
    assert "total_trades" in results
    assert results["total_trades"] > 0
    assert results["strategy_name"] == "Always Yes"
