from dataclasses import dataclass
from typing import Optional, List, Dict, Any
from enum import Enum


class OrderAction(Enum):
    BUY_YES = "BUY_YES"
    BUY_NO = "BUY_NO"
    HOLD = "HOLD"


@dataclass
class TelemetryData:
    gig_id: int
    milestone_id: int
    freelancer_pubkey: str
    sbt_reliability_score: float  # 0 to 100
    git_commits_last_48h: int
    pr_comments_resolved: int
    hours_remaining: float
    current_yes_price: float       # 0.01 to 0.99
    current_no_price: float        # 0.01 to 0.99
    is_private_er_active: bool
    wallet_age_days: int = 0
    onchain_protocol_interactions: int = 0
    linkedin_verified: bool = False
    linkedin_experience_years: int = 0


@dataclass
class OrderSignal:
    market_id: int
    action: OrderAction
    size_lamports: int
    limit_price: float
    use_private_er: bool = True
    rationale: str = ""


class FlintStrategy:
    """
    Base Strategy Class (Inspired by noncausal.ai)
    Developers inherit from FlintStrategy and implement custom signal logic.
    """
    def __init__(self, name: str, capital_budget_lamports: int = 1_000_000_000):
        self.name = name
        self.capital_budget = capital_budget_lamports
        self.allocated_capital = 0
        self.positions: Dict[int, Dict[str, Any]] = {}

    def evaluate_telemetry(self, telemetry: TelemetryData) -> Optional[OrderSignal]:
        """
        Called when new on-chain gig telemetry or commit telemetry arrives.
        Must be overridden by child strategy.
        """
        raise NotImplementedError("Implement evaluate_telemetry in your custom strategy.")

    def buy_yes(self, market_id: int, size_lamports: int, limit_price: float, rationale: str = "") -> OrderSignal:
        return OrderSignal(
            market_id=market_id,
            action=OrderAction.BUY_YES,
            size_lamports=size_lamports,
            limit_price=limit_price,
            use_private_er=True,
            rationale=rationale
        )

    def buy_no(self, market_id: int, size_lamports: int, limit_price: float, rationale: str = "") -> OrderSignal:
        return OrderSignal(
            market_id=market_id,
            action=OrderAction.BUY_NO,
            size_lamports=size_lamports,
            limit_price=limit_price,
            use_private_er=True,
            rationale=rationale
        )
