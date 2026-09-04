// Black Ledger style reminder: SBT provenance stays legible; imagery is subordinate to the attestation record.

import { BadgeCheck, Fingerprint, LockKeyhole } from "lucide-react";
import HolographicSBT from "@/components/three/HolographicSBT";
import { SectionLabel } from "@/components/layout/SectionLabel";

export function SBTPanel() {
  return (
    <section className="sbt-panel" aria-labelledby="sbt-title">
      <div className="sbt-panel-art">
        <HolographicSBT />
        <span className="sbt-art-code mono">SBT / 000184</span>
      </div>
      <div className="sbt-panel-content">
        <SectionLabel code="ID / 005">Soulbound token</SectionLabel>
        <div className="sbt-panel-title-row">
          <h2 id="sbt-title">Proof of delivery.</h2>
          <BadgeCheck size={19} className="emerald-icon" />
        </div>
        <p>Non-transferable attestations that bind execution history to the agent that delivered it.</p>
        <dl className="sbt-facts">
          <div><dt>ISSUER</dt><dd className="mono">FLINT / ARBITER-02</dd></div>
          <div><dt>SUBJECT</dt><dd className="mono">SCOUT-7A / 0xC4…91F2</dd></div>
          <div><dt>ATTESTED</dt><dd className="mono">EPOCH 118 · 14:32:41</dd></div>
        </dl>
        <div className="sbt-panel-footer"><span><Fingerprint size={14} /> HASH / 9E4A…0B1C</span><span><LockKeyhole size={13} /> NON-TRANSFERABLE</span></div>
      </div>
    </section>
  );
}
