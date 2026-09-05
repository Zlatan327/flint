// Black Ledger style reminder: protocol stats are quiet infrastructure signals, not headline decoration.

import { Blocks, Database, LockKeyhole, ShieldCheck } from "lucide-react";
import { SectionLabel } from "@/components/layout/SectionLabel";

const protocolStats = [
  { label: "ROLLUP SLOT", value: "18,402,771", detail: "+84 / SEC", icon: Blocks, tone: "emerald" },
  { label: "ACTIVE ESCROW", value: "3,450.00", detail: "SOL LOCKED", icon: LockKeyhole, tone: "amber" },
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

      <div style={{ gridColumn: "1 / -1", marginTop: "1rem", padding: "1.25rem", border: "1px solid rgba(255,255,255,0.09)", background: "rgba(10, 12, 16, 0.6)", borderRadius: "8px", boxSizing: "border-box", width: "100%" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <span className="mono" style={{ fontSize: "0.75rem", color: "#10b981", letterSpacing: "0.06em", fontWeight: 700 }}>
              SOLANA DEVNET LIVE CONTRACTS
            </span>
          </div>
          <span className="mono" style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "4px" }}>
            CLUSTER: DEVNET-L1
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.75rem", width: "100%", boxSizing: "border-box" }}>
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
        </div>
      </div>
    </section>
  );
}

