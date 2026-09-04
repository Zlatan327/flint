// Black Ledger style reminder: compose from explicit protocol modules; the page should read like an operator console, not a centered landing page.

import { ChevronUp, Github, Shield, Zap } from "lucide-react";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { TopBar } from "@/components/layout/TopBar";
import { MarketBoard } from "@/components/markets/MarketBoard";
import { ScoutTerminal } from "@/components/agents/ScoutTerminal";
import { TelemetryRail } from "@/components/telemetry/TelemetryRail";
import { ProtocolStrip } from "@/components/protocol/ProtocolStrip";
import { SBTPanel } from "@/components/protocol/SBTPanel";

export default function Home() {
  return (
    <div className="flint-app">
      <TopBar />
      <main>
        <HeroBanner />
        <div className="dashboard-shell">
          <div className="dashboard-primary">
            <MarketBoard />
            <div className="lower-grid">
              <ScoutTerminal />
              <SBTPanel />
            </div>
          </div>
          <TelemetryRail />
        </div>
        <ProtocolStrip />
      </main>
      <footer className="site-footer">
        <div className="footer-brand"><span className="brand-mark brand-mark-small" aria-hidden="true"><span className="brand-mark-cut" /></span><span className="brand-name">FLINT</span><span className="mono">PROTOCOL / V1</span></div>
        <div className="footer-links"><a href="#protocol"><Shield size={13} /> TRUST LAYER</a><a href="#agents"><Zap size={13} /> AGENT RUNTIME</a><a target="_blank" href="https://github.com/Zlatan327/asp" rel="noreferrer"><Github size={13} /> SOURCE / GITHUB</a></div>
        <a className="back-top mono" href="#top">BACK TO TOP <ChevronUp size={13} /></a>
      </footer>
    </div>
  );
}
