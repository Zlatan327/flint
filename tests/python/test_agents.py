import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../agents')))

from scout import BuilderProfile, ScoutAgent
from pm_agent import ProjectManagerAgent
from tee_bidding import TEEBiddingService

def test_builder_profile_creation():
    builder = BuilderProfile(
        handle="test", wallet_address="test", sbt_reliability_score=100,
        primary_skills=["Rust"], total_completed_gigs=10, github_verified=True,
        wallet_age_days=100, onchain_protocol_interactions=["a", "b", "c", "d", "e", "f"],
        linkedin_verified=True, linkedin_experience_years=5
    )
    assert builder.handle == "test"
    assert builder.sbt_reliability_score == 100

def test_scout_agent_gig_fit():
    builder = BuilderProfile(
        handle="test", wallet_address="test", sbt_reliability_score=100,
        primary_skills=["Rust", "Anchor"], total_completed_gigs=10, github_verified=True,
        wallet_age_days=400, onchain_protocol_interactions=["a", "b", "c", "d", "e", "f"],
        linkedin_verified=True, linkedin_experience_years=5
    )
    scout = ScoutAgent(builder)
    gig = {"id": 1, "required_skills": ["Rust", "Python"], "budget_sol": 1.0}
    fit = scout.evaluate_gig_fit(gig)
    # Skill score = 1/2 = 0.5. 0.5*0.6 = 0.3
    # Reliability = 1.0*0.3 = 0.3
    # Identity bonus: LI verified: 0.05 + 5*0.01 = 0.1, Wallet >365: 0.05, interactions >5: 0.05 -> 0.2 (capped at 0.2)
    # Total = 0.3 + 0.3 + 0.2 = 0.8
    assert fit == pytest.approx(0.8)

def test_pm_agent_milestone_decomposition():
    pm = ProjectManagerAgent("client123")
    res = pm.structure_project_milestones("Test Project", 10.0, 10)
    assert res["client"] == "client123"
    assert res["total_budget_lamports"] == int(10.0 * 1e9)
    assert res["milestones_count"] == 3
    assert len(res["milestones"]) == 3
    assert res["milestones"][0]["allocation_lamports"] == int(10.0 * 1e9 * 0.3)

def test_tee_bidding_commitment_hash():
    proposal = {"gig_id": 1, "bid_amount_lamports": 1000}
    sealed = TEEBiddingService.create_blind_bid_envelope(proposal, salt="test_salt")
    assert "commitment_hash" in sealed
    assert sealed["is_sealed"] is True
    assert sealed["blind_bid_lamports"] == 1000
    assert "payload_preview" in sealed
