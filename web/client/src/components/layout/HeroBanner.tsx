// Black Ledger style reminder: the hero is a protocol instrument header, not a marketing splash—one claim, a few facts, one action.

import { ArrowDownRight, ArrowUpRight, RadioTower } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import RollupReactor from "@/components/three/RollupReactor";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { fetchOnChainGigs } from "@/lib/flint-chain-sync";
import { fetchOnChainMarkets } from "@/lib/flint-market-client";
import { Connection } from "@solana/web3.js";
import { DEVNET_RPC } from "@/lib/flint-escrow-client";

export function HeroBanner() {
  const [activeGigsCount, setActiveGigsCount] = useState<number | null>(null);
  const [escrowLockedSol, setEscrowLockedSol] = useState<number | null>(null);
  const [epochNum, setEpochNum] = useState<number | null>(null);
  const [currentSlot, setCurrentSlot] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const connection = new Connection(DEVNET_RPC, "confirmed");
        const [epochInfo, gigs, markets] = await Promise.all([
          connection.getEpochInfo().catch(() => null),
          fetchOnChainGigs().catch(() => []),
          fetchOnChainMarkets().catch(() => []),
        ]);

        if (isMounted) {
          if (epochInfo) {
            setEpochNum(epochInfo.epoch);
            setCurrentSlot(epochInfo.absoluteSlot);
          }
          setActiveGigsCount(gigs.length);
          const totalSol = gigs.reduce((acc, g) => {
            const num = parseFloat((g.budget || "").replace(/[^0-9.]/g, "")) || 0;
            return acc + num;
          }, 0);
          setEscrowLockedSol(totalSol);
        }
      } catch (err) {
        console.warn("Failed to load hero banner live stats:", err);
      }
    }
    loadStats();
    const interval = setInterval(loadStats, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="hero-banner" id="top" aria-labelledby="hero-title">
      <div className="hero-art" aria-hidden="true">
        <div className="hero-art-wash" />
        <RollupReactor />
        <div className="hero-art-readout mono"><span>FIELD / L1</span><span>REACTOR / NOMINAL</span></div>
      </div>
      <div className="hero-copy">
        <SectionLabel code="FLINT / 001 · FREELANCE MARKETPLACE" tone="amber">FREELANCE MARKETPLACE</SectionLabel>
        <h1 id="hero-title">Own your reputation.<br /><em>Get paid on-chain.</em></h1>
        <p className="hero-dek">Your work history is yours — not locked inside a platform. Verifiable escrow, 1.5% fees, and instant settlement on Solana.</p>
        <div className="hero-actions">
          <Link href="/exchange" className="amber-button">BROWSE GIGS <ArrowDownRight size={14} /></Link>
          <Link href="/markets" className="text-link">EXPLORE RISK MARKETS <ArrowUpRight size={15} /></Link>
        </div>
      </div>
      <div className="hero-metrics" aria-label="Protocol overview">
        <div className="hero-metric">
          <span className="metric-label">ACTIVE GIGS</span>
          <strong className="mono">{activeGigsCount !== null ? activeGigsCount : "..."}</strong>
          <span className="mono metric-foot">SOLANA DEVNET</span>
        </div>
        <div className="hero-metric">
          <span className="metric-label">VALUE IN ESCROW</span>
          <strong className="mono">{escrowLockedSol !== null ? `${escrowLockedSol.toFixed(2)} SOL` : "SYNCING..."}</strong>
          <span className="mono metric-foot">DEVNET VAULT</span>
        </div>
        <div className="hero-metric">
          <span className="metric-label">NETWORK STATUS</span>
          <strong className="mono"><span className="status-dot status-dot-live" /> DEVNET L1</strong>
          <span className="mono metric-foot">{currentSlot ? `SLOT #${currentSlot.toLocaleString()}` : "CONFIRMED"}</span>
        </div>
        <div className="hero-metric hero-metric-last">
          <RadioTower size={15} />
          <span className="mono">{epochNum ? `EPOCH #${epochNum} / LIVE` : "DEVNET / ONLINE"}</span>
        </div>
      </div>
    </section>
  );
}
