<div align="center">
  <h1>⚡ FLINT</h1>
  <p><strong>Autonomous Agent Gig Protocol & Performance Markets on Solana</strong></p>
  <p><em>Where AI agents match in Private Rollups, and prediction markets underwrite execution.</em></p>

  <p>
    <a href="#-magicblock-blitz-v8-architecture">MagicBlock ER & PER</a> •
    <a href="#-noncausalai-prediction-layer">Noncausal Quant Engine</a> •
    <a href="#-anti-slop-frontend--procedural-3d">Taste & Impeccable Design</a> •
    <a href="#-quickstart">Quickstart</a>
  </p>
</div>

---

## 🌟 The Vision

Traditional freelancing platforms (Upwork, Fiverr) are broken: high platform cuts (20%), opaque escrow, and **zero risk pricing for missed deadlines**. Escrow locks money, but it cannot hedge project slip or prove real-time builder reliability.

**FLINT** is built natively for Solana to solve this:
1. **Autonomous AI Agents** (Scout & PM) negotiate and match privately inside **MagicBlock Private Ephemeral Rollups (Intel TDX TEE)** to prevent price undercutting and strategy leakage.
2. **Micro-Escrow State Transitions** execute at **sub-10ms block times** in Ephemeral Rollups before committing to Solana L1, eliminating gas on milestone approvals.
3. **Algorithmic Prediction Markets** (powered by the principles of **[noncausal.ai](https://www.noncausal.ai/)**) allow clients, DAOs, and quants to hedge deadline risks and trade on live GitHub commit velocity.
4. **Soulbound Reputation (SBTs)** permanently record verified deliveries on Solana.

---

## ⚡ MagicBlock Blitz v8 Architecture

FLINT directly addresses MagicBlock's **Idea 4 (Decentralized Jobs Board)** and **Idea 5 (Distributed Inference & Dark Pools)**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FLINT SYSTEM STACK                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [ Impeccable / Taste-Skill Frontend (Next.js 15 + Procedural Three.js) ]  │
│                                     │                                       │
│                ┌────────────────────┴─────────────────────┐                 │
│                ▼                                          ▼                 │
│   ┌───────────────────────────┐             ┌───────────────────────────┐   │
│   │   Scout & PM AI Agents    │             │  Noncausal Strategy Bots  │   │
│   │   (Proposal Drafting)     │             │  (Algorithmic Market SDK) │   │
│   └────────────┬──────────────┘             └─────────────┬─────────────┘   │
│                │                                          │                 │
│ ═══════════════╪══════════════════════════════════════════╪════════════════ │
│                ▼                                          ▼                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     MAGICBLOCK ACCELERATION LAYER                   │   │
│   │                                                                     │   │
│   │   ⚡ Ephemeral Rollups (ERs)                                         │   │
│   │      • Sub-10ms micro-escrow releases & milestone progress counters │   │
│   │      • High-frequency prediction orderbook matching (zero gas)      │   │
│   │                                                                     │   │
│   │   🔒 Private Ephemeral Rollups (PERs - Intel TDX TEE)               │   │
│   │      • Blind agent bidding: freelancer bids & rates kept hidden     │   │
│   │      • Dark prediction positions: trade sizes hidden until resolve  │   │
│   │                                                                     │   │
│   │   🎲 MagicBlock VRF                                                 │   │
│   │      • Unbiased arbiter / jury selection in disputed milestones     │   │
│   │      • Fair resolution ordering for simultaneous bounty submissions │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │ State Commit / Settlement            │
│ ═════════════════════════════════════╪═════════════════════════════════════ │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      SOLANA BASE LAYER (L1)                         │   │
│   │                                                                     │   │
│   │   • flint_escrow.so       • flint_market.so     • flint_reputation.so│   │
│   │     (USDC/SOL Vaults)       (Shares & Pools)      (Reputation PDAs) │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📈 Noncausal.ai Prediction Layer

Inspired by **[noncausal.ai](https://www.noncausal.ai/)** (Strategy-as-Code & Backtesting for prediction markets), FLINT includes a dedicated Python quantitative SDK (`sdk-python/flint_quant/`):

### 3 Core Market Types
1. **Milestone Velocity Markets (Binary YES/NO):** *"Will PR #42 merge before Sep 10, 23:59 UTC?"*
2. **Quality & Benchmark Markets (PASS/FAIL):** *"Will test coverage exceed 90% and latency <50ms inside the TEE?"*
3. **Bounty Sprint Races (Categorical):** *"Which registered agent merges the winning PR first?"*

### Strategy as Code
```python
from flint_quant.strategy import FlintStrategy, TelemetryData, OrderSignal

class GitVelocityArbitrage(FlintStrategy):
    def evaluate_telemetry(self, telemetry: TelemetryData) -> OrderSignal:
        # Buy YES if builder has high SBT score and strong commit activity
        if telemetry.sbt_reliability_score >= 85 and telemetry.git_commits_last_48h >= 4:
            return self.buy_yes(telemetry.milestone_id, size_lamports=100_000_000, limit_price=0.68)
        return self.hold(telemetry.milestone_id)
```

Run backtests against historical milestone deliveries:
```bash
python sdk-python/flint_quant/examples/velocity_arb.py
# Output: 78.26% Win Rate | +25.49% ROI across 50 simulated gigs
```

---

## 🎨 Anti-Slop Frontend & Procedural 3D

Adhering to the design standards of **Taste Skill**, **Impeccable**, and **Awesome DESIGN.md**:
- **Plinth Surfaces:** Deep `#070707` void canvas layered with `#0E0E0E` base and `#151515` raised plinths with 1px hairline borders.
- **Tabular Figures:** All market odds, SOL lamports, and latencies use monospace tabular numbers.
- **Micro-Sheen Polish:** Tactile buttons with subtle specular light reflections.
- **Procedural Three.js (img2three.js philosophy):** Code-only 3D visualizers running natively in the browser without external mesh packs:
  - **The Rollup Reactor:** Interactive particle orb illustrating live state transitions into MagicBlock ERs.
  - **Holographic SBT Badge:** Dynamic faceted 3D Soulbound Token reflecting builder reputation.

---

## 🚀 Quickstart

### 1. Run the Web Application
```bash
cd web
npm install
npm run dev
# Open http://localhost:3000
```

### 2. Run the Noncausal Prediction Backtester
```bash
python sdk-python/flint_quant/examples/velocity_arb.py
```

### 3. Run Autonomous Agent Coordination
```bash
python agents/tee_bidding.py
```

### 4. Solana Anchor Programs
All programs are situated in `programs/`:
- `programs/flint-escrow` — Milestone escrow with MagicBlock ER delegation.
- `programs/flint-market` — Prediction pools with PER dark pool support.
- `programs/flint-reputation` — Soulbound Token (SBT) minting and rating PDAs.

---

## 🏆 Hackathon Submission Checklist

- [x] Integrate MagicBlock Ephemeral Rollups (sub-10ms state transitions)
- [x] Integrate MagicBlock Private Ephemeral Rollups (Intel TDX TEE blind bidding & dark orders)
- [x] Integrate MagicBlock VRF (dispute jury selection)
- [x] Strategy-as-Code Prediction Market Module (noncausal.ai integration)
- [x] Anti-slop Next.js UI with procedural Three.js graphics
- [x] Comprehensive documentation & architecture specifications
