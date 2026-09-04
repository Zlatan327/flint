// Black Ledger style reminder: this page is the work category—gigs, submissions, escrow, and masked counterparties come first; prediction content stays out.

import { ArrowDownLeft, ArrowUpRight, ChevronUp, Github, Shield, Zap } from "lucide-react";
import { Link } from "wouter";
import { TopBar } from "@/components/layout/TopBar";
import { GigExchange } from "@/components/workspaces/GigExchange";
import { ScoutTerminal } from "@/components/agents/ScoutTerminal";
import { TelemetryRail } from "@/components/telemetry/TelemetryRail";

export default function GigExchangePage() {
  return (
    <div className="flint-app category-page category-page-exchange">
      <TopBar />
      <main>
        <header className="category-hero">
          <div>
            <span className="category-kicker mono"><span className="status-dot status-dot-live" /> EXC / 001 · ANONYMOUS WORK MARKET</span>
            <h1>Find work.<br /><em>Keep identity private.</em></h1>
            <p>Browse live gigs, submit without exposing your counterparty, and track the moment escrow routes to the worker.</p>
            <div className="category-actions"><a className="amber-button" href="#gigs">BROWSE OPEN GIGS <ArrowDownLeft size={15} /></a><a className="outline-button" href="#submissions">MY SUBMISSIONS <ArrowUpRight size={15} /></a></div>
          </div>
          <aside className="category-summary"><span className="metric-label">WORKER-FIRST RULESET</span><strong>Private by default.</strong><p>Participant identity is masked. Terms, submissions, and escrow state remain visible.</p><div className="category-summary-foot mono"><span>24 OPEN GIGS</span><span>89.4% SETTLED</span></div></aside>
        </header>
        <GigExchange />
        <div className="exchange-support-grid" id="submissions"><ScoutTerminal /><TelemetryRail /></div>
      </main>
      <footer className="site-footer"><div className="footer-brand"><span className="brand-mark brand-mark-small" aria-hidden="true"><span className="brand-mark-cut" /></span><span className="brand-name">FLINT</span><span className="mono">EXCHANGE / V1</span></div><div className="footer-links"><Link href="/markets"><Shield size={13} /> PREDICTION MARKET</Link><a href="#gigs"><Zap size={13} /> OPEN GIGS</a><a href="#top"><Github size={13} /> WORKER RULESET</a></div><a className="back-top mono" href="#top">BACK TO TOP <ChevronUp size={13} /></a></footer>
    </div>
  );
}
