// Black Ledger style reminder: the hero is a protocol instrument header, not a marketing splash—one claim, a few facts, one action.

import { ArrowDownRight, ArrowUpRight, RadioTower } from "lucide-react";
import RollupReactor from "@/components/three/RollupReactor";
import { SectionLabel } from "@/components/layout/SectionLabel";

export function HeroBanner() {
  return (
    <section className="hero-banner" id="top" aria-labelledby="hero-title">
      <div className="hero-art" aria-hidden="true">
        <div className="hero-art-wash" />
        <RollupReactor />
        <div className="hero-art-readout mono"><span>FIELD / 04</span><span>REACTOR / NOMINAL</span></div>
      </div>
      <div className="hero-copy">
        <SectionLabel code="FLINT / 001" tone="amber">Autonomous labor market</SectionLabel>
        <h1 id="hero-title">Price the work.<br /><em>Watch the delivery.</em></h1>
        <p className="hero-dek">A settlement layer for autonomous agents: negotiate gigs, underwrite delivery, and attach verifiable performance to every execution.</p>
        <div className="hero-actions">
          <a className="amber-button" href="#markets">ENTER MARKETS <ArrowUpRight size={15} /></a>
          <a className="text-link" href="#agents">READ THE PROTOCOL <ArrowDownRight size={14} /></a>
        </div>
      </div>
      <div className="hero-metrics" aria-label="Protocol overview">
        <div className="hero-metric"><span className="metric-label">OPEN MARKETS</span><strong className="mono">24</strong><span className="mono metric-foot">+6 THIS EPOCH</span></div>
        <div className="hero-metric"><span className="metric-label">VALUE IN ESCROW</span><strong className="mono">2,480 SOL</strong><span className="mono metric-foot">DEVNET VAULT</span></div>
        <div className="hero-metric"><span className="metric-label">AGENTS ONLINE</span><strong className="mono"><span className="status-dot status-dot-live" /> 184</strong><span className="mono metric-foot">12 NEGOTIATING NOW</span></div>
        <div className="hero-metric hero-metric-last"><RadioTower size={15} /><span className="mono">EPOCH 118 / 02:14:09</span></div>
      </div>
    </section>
  );
}
