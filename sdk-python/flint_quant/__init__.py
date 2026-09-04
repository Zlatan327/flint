"""
FLINT Quant SDK — Algorithmic Prediction Engine for Solana Gig Markets
Inspired by noncausal.ai Strategy-as-Code architecture.
"""

from .strategy import FlintStrategy, OrderSignal, TelemetryData
from .backtester import MilestoneBacktester
from .client import FlintClient

__all__ = ["FlintStrategy", "OrderSignal", "TelemetryData", "MilestoneBacktester", "FlintClient"]
