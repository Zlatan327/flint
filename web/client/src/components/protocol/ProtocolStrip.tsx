// Black Ledger style reminder: protocol stats are quiet infrastructure signals, not headline decoration.

import { Blocks, Database, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { PROTOCOL_TREASURY_PDA, DEVNET_RPC } from "@/lib/flint-escrow-client";
import { fetchOnChainGigs } from "@/lib/flint-chain-sync";

export function ProtocolStrip() {
  const [slot, setSlot] = useState<number | null>(null);
  const [activeEscrowSol, setActiveEscrowSol] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const start = performance.now();
        const [slotRes, gigs] = await Promise.all([
          fetch(DEVNET_RPC, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getSlot" }),
          }).then((r) => r.json()).catch(() => null),
          fetchOnChainGigs().catch(() => []),
        ]);
        const rtt = Math.round(performance.now() - start);

        if (isMounted) {
          setLatency(rtt);
          if (slotRes?.result) setSlot(slotRes.result);
          const total = gigs.reduce((acc, g) => {
            const num = parseFloat((g.budget || "").replace(/[^0-9.]/g, "")) || 0;
            return acc + num;
          }, 0);
          setActiveEscrowSol(total);
        }
      } catch (err) {
        console.warn("Failed to load live protocol stats:", err);
      }
    }
    load();
    const interval = setInterval(load, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const protocolStats = [
    {
      label: "L1 BLOCK SLOT",
      value: slot !== null ? `#${slot.toLocaleString()}` : "SYNCING...",
      detail: "+DEVNET CONSENSUS",
      icon: Blocks,
      tone: "emerald",
    },
    {
      label: "ACTIVE ESCROW",
      value: activeEscrowSol !== null ? `${activeEscrowSol.toFixed(2)}` : "...",
      detail: "SOL LOCKED IN VAULTS",
      icon: LockKeyhole,
      tone: "amber",
    },
    {
      label: "PROTOCOL RAKE",
      value: "1.50%",
      detail: "ESCROW SETTLEMENT",
      icon: ShieldCheck,
      tone: "amber",
    },
    {
      label: "INDEXER STATUS",
      value: "NOMINAL",
      detail: latency !== null ? `${latency}MS LATENCY` : "POLLING...",
      icon: Database,
      tone: "default",
    },
  ];

  return (
    <section className="protocol-strip" id="protocol" aria-labelledby="protocol-title">
      <div className="protocol-intro">
        <SectionLabel code="SYS / 004">Protocol status</SectionLabel>
        <h2 id="protocol-title">Signed, not assumed.</h2>
      </div>
      <div className="protocol-stats">
        {protocolStats.map(({ label, value, detail, icon: Icon, tone }) => (
          <div className="protocol-stat" key={label}>
            <div className={`protocol-icon protocol-icon-${tone}`}><Icon size={15} /></div>
            <span className="metric-label">{label}</span>
            <strong className="mono">{value}</strong>
            <span className="mono protocol-detail">{detail}</span>
          </div>
        ))}
      </div>

      <div style={{ gridColumn: "1 / -1", marginTop: "1rem", padding: "1.25rem", border: "1px solid rgba(255,255,255,0.09)", background: "rgba(10, 12, 16, 0.6)", borderRadius: "8px", boxSizing: "border-box", width: "100%" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <span className="mono" style={{ fontSize: "0.75rem", color: "#10b981", letterSpacing: "0.06em", fontWeight: 700 }}>
              SOLANA DEVNET LIVE CONTRACTS & TREASURY
            </span>
          </div>
          <span className="mono" style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "4px" }}>
            CLUSTER: DEVNET-L1
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem", width: "100%", boxSizing: "border-box" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.05em" }}>ESCROW & DELEGATION</span>
            <a href="https://explorer.solana.com/address/2PQbtiG8dxUqr2jSX1RfxiJnXutndhGkHm9k4YrKQD6h?cluster=devnet" target="_blank" rel="noreferrer" className="mono" style={{ color: "#38bdf8", textDecoration: "none", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              2PQbtiG8...KQD6h ↗
            </a>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.05em" }}>PREDICTION MARKET</span>
            <a href="https://explorer.solana.com/address/95ZEnzPdUE1bmF1oF2qjrYaGYPKyeeEmyz8h2xRgJ7e3?cluster=devnet" target="_blank" rel="noreferrer" className="mono" style={{ color: "#38bdf8", textDecoration: "none", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              95ZEnzPd...RgJ7e3 ↗
            </a>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.05em" }}>SBT REPUTATION REGISTRY</span>
            <a href="https://explorer.solana.com/address/J6JQJBVYB1ercx1rexHhAYYStaGWhx51YnEgbcr8AAWg?cluster=devnet" target="_blank" rel="noreferrer" className="mono" style={{ color: "#38bdf8", textDecoration: "none", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              J6JQJBVY...8AAWg ↗
            </a>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.05em" }}>PROTOCOL TREASURY</span>
            <a href={`https://explorer.solana.com/address/${PROTOCOL_TREASURY_PDA.toBase58()}?cluster=devnet`} target="_blank" rel="noreferrer" className="mono" style={{ color: "#FF6B00", textDecoration: "none", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {PROTOCOL_TREASURY_PDA.toBase58().slice(0, 8)}... (1.5% Rake) ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

