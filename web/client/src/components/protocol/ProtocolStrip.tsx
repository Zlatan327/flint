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
    </section>
  );
}
