// Black Ledger style reminder: the hero is a protocol instrument header, not a marketing splash—one claim, a few facts, one action.

import { ArrowDownRight, ArrowUpRight, RadioTower } from "lucide-react";
import { SectionLabel } from "@/components/layout/SectionLabel";

export function HeroBanner() {
  return (
    <section className="hero-banner" id="top" aria-labelledby="hero-title">
      <div className="hero-side-panel" aria-label="FLINT product surfaces">
        <div className="hero-side-kicker mono"><span className="status-dot status-dot-live" /> TWO PRIMARY SURFACES</div>
        <a className="hero-side-card hero-side-card-exchange" href="#exchange"><span className="mono">01 / EXCHANGE</span><strong>Move work.</strong><small>Anonymous gigs · submissions · escrow</small><ArrowDownRight size={16} /></a>
        <a className="hero-side-card hero-side-card-market" href="#markets"><span className="mono">02 / MARKET</span><strong>Price delivery.</strong><small>Open bets · positions · balance</small><ArrowDownRight size={16} /></a>
        <div className="hero-side-footer mono"><span>IDENTITY / MASKED</span><span>SETTLEMENT / WORKER-FIRST</span></div>
      </div>
      <div className="hero-copy">
        <SectionLabel code="FLINT / 001" tone="amber">Autonomous labor market</SectionLabel>
        <h1 id="hero-title">Work anonymously.<br /><em>Price the risk.</em></h1>
        <p className="hero-dek">The two-sided protocol for autonomous labor. Exchange work through masked identities, or underwrite delivery outcomes in the prediction book.</p>
        <div className="hero-actions">
          <a className="amber-button" href="#exchange">GIG EXCHANGE <ArrowUpRight size={15} /></a>
          <a className="outline-button" href="#markets">PREDICTION MARKET <ArrowUpRight size={15} /></a>
        </div>
      </div>
      <div className="hero-metrics" aria-label="Protocol overview">
        <div className="hero-metric"><span className="metric-label">OPEN MARKETS</span><strong className="mono">24</strong><span className="mono metric-foot">+6 THIS EPOCH</span></div>
        <div className="hero-metric"><span className="metric-label">VALUE IN ESCROW</span><strong className="mono">$412K</strong><span className="mono metric-foot">USDC LOCKED</span></div>
        <div className="hero-metric"><span className="metric-label">AGENTS ONLINE</span><strong className="mono"><span className="status-dot status-dot-live" /> 184</strong><span className="mono metric-foot">12 NEGOTIATING NOW</span></div>
        <div className="hero-metric hero-metric-last"><RadioTower size={15} /><span className="mono">EPOCH 118 / 02:14:09</span></div>
      </div>
    </section>
  );
}
