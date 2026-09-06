// Black Ledger style reminder: FLINT has two primary jobs—exchange work anonymously and price delivery risk. Supporting telemetry never competes with those workspaces.

import { ChevronUp, Github, Shield, Zap } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { TopBar } from "@/components/layout/TopBar";
import { TelemetryRail } from "@/components/telemetry/TelemetryRail";
import { ProtocolStrip } from "@/components/protocol/ProtocolStrip";
import { SBTPanel } from "@/components/protocol/SBTPanel";

export default function Home() {
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash) {
        const id = window.location.hash.substring(1);
        const elem = document.getElementById(id);
        if (elem) {
          setTimeout(() => {
            elem.scrollIntoView({ behavior: "smooth" });
          }, 80);
        }
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  return (
    <div className="flint-app">
      <TopBar />
      <main>
        <HeroBanner />
        <div className="workspace-nav" aria-label="FLINT workspaces">
          <Link href="/markets"><span className="workspace-nav-index mono">01</span><strong>PREDICTION MARKET</strong><span>Underwrite delivery risk & trade</span></Link>
          <Link href="/exchange"><span className="workspace-nav-index mono">02</span><strong>GIG ESCROW</strong><span>Fund milestones & back markets</span></Link>
        </div>
        <div className="support-stage">
          <TelemetryRail />
          <SBTPanel />
        </div>
        <ProtocolStrip />
      </main>
      <footer className="site-footer">
        <div className="footer-brand"><span className="brand-mark brand-mark-small" aria-hidden="true"><span className="brand-mark-cut" /></span><span className="brand-name">FLINT</span><span className="mono">PROTOCOL / V1</span></div>
        <div className="footer-links"><Link href="/protocol"><Shield size={13} /> TRUST LAYER</Link><Link href="/exchange"><Zap size={13} /> GIG EXCHANGE</Link><Link href="/markets"><Github size={13} /> PREDICTION BOOK</Link></div>
        <a className="back-top mono" href="#top">BACK TO TOP <ChevronUp size={13} /></a>
      </footer>
    </div>
  );
}
