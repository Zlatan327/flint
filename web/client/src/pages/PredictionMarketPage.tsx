// Black Ledger style reminder: this page is the risk category—markets, odds, positions, and wallet balance come first; gig discovery stays out.

import { ArrowDownLeft, ArrowUpRight, ChevronUp, Github, Shield, WalletCards } from "lucide-react";
import { Link } from "wouter";
import { TopBar } from "@/components/layout/TopBar";
import { PredictionMarket } from "@/components/workspaces/PredictionMarket";
import { ProtocolStrip } from "@/components/protocol/ProtocolStrip";
import { SBTPanel } from "@/components/protocol/SBTPanel";
import { useFlintWallet } from "@/contexts/WalletContext";

export default function PredictionMarketPage() {
  const { connected, balance } = useFlintWallet();
  const displayBalance = connected && balance !== null ? `${balance.toFixed(2)} SOL` : "0.00 SOL";

  return (
    <div className="flint-app category-page category-page-markets">
      <TopBar />
      <main>
        <header className="category-hero">
          <div>
            <span className="category-kicker mono"><span className="status-dot status-dot-live" /> MKT / 001 · DELIVERY RISK BOOK</span>
            <h1>Price delivery.<br /><em>Trade the outcome.</em></h1>
            <p>See current bets, open YES or NO positions, and keep your available balance visible while gigs move through settlement.</p>
            <div className="category-actions"><a className="amber-button" href="#book">VIEW CURRENT BETS <ArrowDownLeft size={15} /></a><a className="outline-button" href="#positions">MY POSITIONS <ArrowUpRight size={15} /></a></div>
          </div>
          <aside className="category-summary category-summary-market"><WalletCards size={16} /><span className="metric-label">AVAILABLE BALANCE</span><strong className="mono">{displayBalance}</strong><p>Open positions and market capital remain separate from worker escrow.</p><div className="category-summary-foot mono"><span>24 OPEN BOOKS</span><span>0.60 SOL STAKED</span></div></aside>
        </header>
        <div id="book"><PredictionMarket /></div>
        <div className="market-support-grid" id="positions"><SBTPanel /><ProtocolStrip /></div>
      </main>
      <footer className="site-footer"><div className="footer-brand"><span className="brand-mark brand-mark-small" aria-hidden="true"><span className="brand-mark-cut" /></span><span className="brand-name">FLINT</span><span className="mono">MARKETS / V1</span></div><div className="footer-links"><Link href="/exchange"><Shield size={13} /> GIG EXCHANGE</Link><a href="#book"><WalletCards size={13} /> CURRENT BOOK</a><a href="#positions"><Github size={13} /> POSITION LEDGER</a></div><a className="back-top mono" href="#top">BACK TO TOP <ChevronUp size={13} /></a></footer>
    </div>
  );
}
