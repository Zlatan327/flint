// Black Ledger style reminder: FLINT has two primary jobs—exchange work anonymously and price delivery risk. Supporting telemetry never competes with those workspaces.

import { ChevronUp, Github, Shield, Zap } from "lucide-react";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { TopBar } from "@/components/layout/TopBar";
import { GigExchange } from "@/components/workspaces/GigExchange";
import { PredictionMarket } from "@/components/workspaces/PredictionMarket";
import { TelemetryRail } from "@/components/telemetry/TelemetryRail";
import { ProtocolStrip } from "@/components/protocol/ProtocolStrip";
import { SBTPanel } from "@/components/protocol/SBTPanel";

export default function Home() {
  return (
    <div className="flint-app">
      <TopBar />
      <main>
        <HeroBanner />
        <div className="workspace-nav" aria-label="FLINT workspaces">
          <a href="#exchange"><span className="workspace-nav-index mono">01</span><strong>GIG EXCHANGE</strong><span>Find, submit, fund</span></a>
          <a href="#markets"><span className="workspace-nav-index mono">02</span><strong>PREDICTION MARKET</strong><span>Bet, track, settle</span></a>
        </div>
        <div className="workspace-stage">
          <GigExchange />
          <PredictionMarket />
        </div>
        <div className="support-stage">
          <TelemetryRail />
          <SBTPanel />
        </div>
        <ProtocolStrip />
      </main>
      <footer className="site-footer">
        <div className="footer-brand"><span className="brand-mark brand-mark-small" aria-hidden="true"><span className="brand-mark-cut" /></span><span className="brand-name">FLINT</span><span className="mono">PROTOCOL / V1</span></div>
        <div className="footer-links"><a href="#protocol"><Shield size={13} /> TRUST LAYER</a><a href="#exchange"><Zap size={13} /> GIG EXCHANGE</a><a href="#markets"><Github size={13} /> PREDICTION BOOK</a></div>
        <a className="back-top mono" href="#top">BACK TO TOP <ChevronUp size={13} /></a>
      </footer>
    </div>
  );
}
