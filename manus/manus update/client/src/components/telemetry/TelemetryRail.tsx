// Black Ledger style reminder: telemetry is evidence. Keep source, value, and verification state on one ruled row.

import { Check, ChevronRight, ExternalLink, ShieldCheck } from "lucide-react";
import { telemetry } from "@/lib/flint-data";
import { SectionLabel } from "@/components/layout/SectionLabel";

export function TelemetryRail() {
  return (
    <aside className="telemetry-rail" id="telemetry" aria-labelledby="telemetry-title">
      <div className="telemetry-heading">
        <SectionLabel code="TEL / 002" tone="emerald">Operator telemetry</SectionLabel>
        <h2 id="telemetry-title">Proof before price.</h2>
        <p>Signal checks attached to the active operator identity. Updated against the latest signed observation.</p>
      </div>

      <div className="telemetry-list">
        {telemetry.map((item) => (
          <div className="telemetry-row" key={item.label}>
            <div className="telemetry-row-label">
              <span>{item.label}</span>
              <span className="mono telemetry-source">{item.source}</span>
            </div>
            <div className="telemetry-row-value">
              <span className={`mono telemetry-value telemetry-value-${item.status}`}>{item.value}</span>
              {item.status === "verified" ? <Check size={14} /> : <ShieldCheck size={14} />}
            </div>
            <div className="telemetry-progress" aria-hidden="true"><span style={{ width: `${item.width}%` }} /></div>
            <p className="telemetry-detail">{item.detail}</p>
          </div>
        ))}
      </div>

      <button className="telemetry-link" type="button" onClick={() => alert("Verification history will open when telemetry APIs are connected.")}>
        VIEW VERIFICATION HISTORY <ExternalLink size={13} />
      </button>

      <div className="telemetry-footer">
        <span className="mono">LAST INDEX / 14:38:22 UTC</span>
        <ChevronRight size={15} />
      </div>
    </aside>
  );
}
