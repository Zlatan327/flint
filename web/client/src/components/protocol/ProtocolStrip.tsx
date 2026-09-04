// Black Ledger style reminder: protocol stats are quiet infrastructure signals, not headline decoration.

import { Blocks, Database, LockKeyhole, ShieldCheck } from "lucide-react";
import { SectionLabel } from "@/components/layout/SectionLabel";

const protocolStats = [
  { label: "ROLLUP SLOT", value: "18,402,771", detail: "+84 / SEC", icon: Blocks, tone: "emerald" },
  { label: "ACTIVE ESCROW", value: "34,515.50", detail: "USDC LOCKED", icon: LockKeyhole, tone: "amber" },
  { label: "SETTLEMENT RATE", value: "98.7%", detail: "LAST 30 DAYS", icon: ShieldCheck, tone: "default" },
  { label: "INDEXER STATUS", value: "NOMINAL", detail: "184MS LATENCY", icon: Database, tone: "default" },
];

export function ProtocolStrip() {
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

      <div style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.4)", borderRadius: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <span className="mono" style={{ fontSize: "0.75rem", color: "#10b981", letterSpacing: "0.05em", fontWeight: 600 }}>● SOLANA DEVNET LIVE CONTRACTS</span>
          <span className="mono" style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>CLUSTER / DEVNET</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.75rem", fontSize: "0.75rem" }}>
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.5rem 0.75rem", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", display: "block", fontSize: "0.65rem" }}>ESCROW PROGRAM</span>
            <a href="https://explorer.solana.com/address/2PQbtiG8dxUqr2jSX1RfxiJnXutndhGkHm9k4YrKQD6h?cluster=devnet" target="_blank" rel="noreferrer" className="mono" style={{ color: "#38bdf8", textDecoration: "none", wordBreak: "break-all" }}>
              2PQb...QD6h ↗
            </a>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.5rem 0.75rem", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", display: "block", fontSize: "0.65rem" }}>MARKET PROGRAM</span>
            <a href="https://explorer.solana.com/address/95ZEnzPdUE1bmF1oF2qjrYaGYPKyeeEmyz8h2xRgJ7e3?cluster=devnet" target="_blank" rel="noreferrer" className="mono" style={{ color: "#38bdf8", textDecoration: "none", wordBreak: "break-all" }}>
              95ZE...J7e3 ↗
            </a>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.5rem 0.75rem", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", display: "block", fontSize: "0.65rem" }}>SBT REPUTATION PROGRAM</span>
            <a href="https://explorer.solana.com/address/J6JQJBVYB1ercx1rexHhAYYStaGWhx51YnEgbcr8AAWg?cluster=devnet" target="_blank" rel="noreferrer" className="mono" style={{ color: "#38bdf8", textDecoration: "none", wordBreak: "break-all" }}>
              J6JQ...AAWg ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

