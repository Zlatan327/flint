import time
import json
import logging
import asyncio
from typing import Dict, Any

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../sdk-python")))

from solana.rpc.async_api import AsyncClient
from solana.rpc.websocket_api import connect
from solders.pubkey import Pubkey

from flint_quant.examples.velocity_arb import GitVelocityArbitrageStrategy
from flint_quant.strategy import TelemetryData
from agents.scout import ScoutAgent, BuilderProfile

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(message)s')

FLINT_ESCROW_PROGRAM_ID = Pubkey.from_string("FLiNTEscrow111111111111111111111111111111111")
RPC_URL = "https://api.devnet.solana.com"
WSS_URL = "wss://api.devnet.solana.com"

class FlintAgentIndexer:
    def __init__(self):
        self.strategy = GitVelocityArbitrageStrategy(name="LiveArb_v1")
        self.scout_agent = ScoutAgent(builder=BuilderProfile(
            handle="sol_wizard",
            wallet_address="9z8x...Sol",
            sbt_reliability_score=94,
            primary_skills=["Rust", "Anchor", "Next.js"],
            total_completed_gigs=16,
            github_verified=True,
            wallet_age_days=876,
            onchain_protocol_interactions=["Jupiter", "MagicBlock", "Tensor"],
            linkedin_verified=True,
            linkedin_experience_years=4
        ))

    async def start(self):
        logging.info(f"Flint Agent Indexer started. Connecting to {WSS_URL}...")
        
        async with connect(WSS_URL) as websocket:
            await websocket.logs_subscribe(
                filter_=FLINT_ESCROW_PROGRAM_ID,
                commitment="confirmed"
            )
            logging.info(f"Subscribed to logs for program: {FLINT_ESCROW_PROGRAM_ID}")

            # Also spawn the oracle simulation to feed github telemetry periodically
            asyncio.create_task(self._simulate_github_oracle())

            while True:
                msg = await websocket.recv()
                self._parse_log_message(msg)

    def _parse_log_message(self, msg: Any):
        if not hasattr(msg, "result") or not msg.result:
            return
        
        logs = msg.result.value.logs
        signature = msg.result.value.signature
        
        for log in logs:
            if "Flint: Gig #" in log and "initialized" in log:
                # E.g. "Program log: Flint: Gig #401 initialized for 3500000000 lamports"
                logging.info(f"EVENT [Tx: {signature[:8]}]: {log}")
                self.handle_gig_created({"gig_id": 401, "budget_sol": 3.5, "required_skills": ["Anchor", "Rust"]})
            elif "delegated to MagicBlock Ephemeral Rollup" in log:
                logging.info(f"EVENT [Tx: {signature[:8]}]: {log}")
                self.handle_er_delegation(gig_id=401)
            elif "settled to L1" in log:
                logging.info(f"EVENT [Tx: {signature[:8]}]: {log}")

    async def _simulate_github_oracle(self):
        """Simulates incoming GitHub webhooks for the hackathon."""
        await asyncio.sleep(15) # wait for some time before pushing telemetry
        self.handle_github_telemetry_update(gig_id=401, commits=5, hours_remaining=48)

    def handle_gig_created(self, gig: Dict[str, Any]):
        proposal = self.scout_agent.generate_blind_proposal(gig)
        logging.info(f"SCOUT AGENT: Fit score calculated at {proposal['fit_score']}. Submitting blind TEE proposal.")

    def handle_er_delegation(self, gig_id: int):
        logging.info(f"MARKET: Spawning binary velocity prediction market for Gig #{gig_id}.")

    def handle_github_telemetry_update(self, gig_id: int, commits: int, hours_remaining: int):
        logging.info(f"ORACLE: GitHub velocity updated for Gig #{gig_id} ({commits} commits).")
        
        telemetry = TelemetryData(
            gig_id=gig_id,
            milestone_id=1,
            freelancer_pubkey="9z8x...Sol",
            sbt_reliability_score=self.scout_agent.builder.sbt_reliability_score,
            git_commits_last_48h=commits,
            pr_comments_resolved=3,
            hours_remaining=hours_remaining,
            current_yes_price=0.55,
            current_no_price=0.45,
            is_private_er_active=True,
            wallet_age_days=self.scout_agent.builder.wallet_age_days,
            linkedin_verified=self.scout_agent.builder.linkedin_verified,
            onchain_protocol_interactions=len(self.scout_agent.builder.onchain_protocol_interactions)
        )

        signal = self.strategy.evaluate_telemetry(telemetry)
        if signal.action.name != "HOLD":
            logging.info(f"QUANT BOT: Executing {signal.action.name} order via MagicBlock PER. Rationale: {signal.rationale}")

if __name__ == "__main__":
    indexer = FlintAgentIndexer()
    try:
        asyncio.run(indexer.start())
    except KeyboardInterrupt:
        logging.info("Indexer stopped.")
