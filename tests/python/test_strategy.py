import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../sdk-python')))

from flint_quant.strategy import FlintStrategy, OrderAction, TelemetryData, OrderSignal

class DummyStrategy(FlintStrategy):
    def evaluate_telemetry(self, telemetry: TelemetryData) -> OrderSignal:
        if telemetry.sbt_reliability_score > 80:
            return self.buy_yes(telemetry.milestone_id, 1000, 0.5)
        else:
            return self.buy_no(telemetry.milestone_id, 1000, 0.5)

def test_strategy_creation():
    strategy = DummyStrategy("TestStrategy", 1000000)
    assert strategy.name == "TestStrategy"
    assert strategy.capital_budget == 1000000

def test_evaluate_telemetry_buy_yes():
    strategy = DummyStrategy("Test", 1000)
    telemetry = TelemetryData(
        gig_id=1, milestone_id=1, freelancer_pubkey="x", 
        sbt_reliability_score=90, git_commits_last_48h=10, pr_comments_resolved=0,
        hours_remaining=10, current_yes_price=0.5, current_no_price=0.5, is_private_er_active=True
    )
    signal = strategy.evaluate_telemetry(telemetry)
    assert signal.action == OrderAction.BUY_YES
    assert signal.size_lamports == 1000

def test_evaluate_telemetry_buy_no():
    strategy = DummyStrategy("Test", 1000)
    telemetry = TelemetryData(
        gig_id=1, milestone_id=1, freelancer_pubkey="x", 
        sbt_reliability_score=70, git_commits_last_48h=1, pr_comments_resolved=0,
        hours_remaining=10, current_yes_price=0.5, current_no_price=0.5, is_private_er_active=True
    )
    signal = strategy.evaluate_telemetry(telemetry)
    assert signal.action == OrderAction.BUY_NO
    assert signal.size_lamports == 1000

def test_order_action_enum():
    assert OrderAction.BUY_YES.value == "BUY_YES"
    assert OrderAction.BUY_NO.value == "BUY_NO"
    assert OrderAction.HOLD.value == "HOLD"
