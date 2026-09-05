// Black Ledger style reminder: the market board is the primary reading surface, so structure beats decoration.

import { Filter, Plus, Loader2, BarChart3, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchOnChainMarkets } from "@/lib/flint-market-client";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { MarketCard } from "@/components/markets/MarketCard";
import { Link } from "wouter";

export function MarketBoard() {
  const [marketList, setMarketList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const liveMarkets = await fetchOnChainMarkets();
        if (isMounted) setMarketList(liveMarkets);
      } catch (err) {
        console.warn("Failed to load on-chain markets:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="board-section" id="markets" aria-labelledby="markets-title">
      <div className="section-heading-row">
        <div>
          <SectionLabel code="MKT / 001">Prediction markets</SectionLabel>
          <h2 id="markets-title">Price the delivery.</h2>
        </div>
        <div className="section-heading-actions">
          <Link href="/markets" className="amber-button mono" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Plus size={15} /> OPEN MARKET
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "4rem 2rem", textAlign: "center", color: "rgba(255,255,255,0.5)" }} className="mono">
          <Loader2 size={24} className="animate-spin inline mr-2 text-amber-500" />
          <span>Scanning Solana Devnet for active prediction markets...</span>
        </div>
      ) : marketList.length === 0 ? (
        <div
          style={{
            padding: "3rem 2rem",
            textAlign: "center",
            border: "1px dashed rgba(255, 255, 255, 0.12)",
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.01)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <BarChart3 size={32} color="rgba(255,255,255,0.2)" />
          <h4 style={{ color: "#fff", fontSize: "1.05rem", margin: "0 0 4px" }}>0 Live Prediction Markets</h4>
          <p style={{ color: "rgba(255, 255, 255, 0.5)", maxWidth: "420px", margin: "0 auto", fontSize: "0.82rem" }}>
            All prediction markets operate on Solana Devnet PDAs. Open the first prediction market to underwrite delivery risk.
          </p>
          <Link
            href="/markets"
            className="amber-button mono"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", padding: "7px 14px", marginTop: "4px" }}
          >
            GO TO PREDICTION DESK <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="market-grid">
          {marketList.map((market, index) => (
            <MarketCard key={market.id} market={market} featured={index === 0} />
          ))}
        </div>
      )}
    </section>
  );
}
