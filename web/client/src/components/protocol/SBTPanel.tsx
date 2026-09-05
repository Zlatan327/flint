import { BadgeCheck, Fingerprint, LockKeyhole, ArrowRight } from "lucide-react";
import HolographicSBT from "@/components/three/HolographicSBT";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { useFlintWallet } from "@/contexts/WalletContext";
import { Link } from "wouter";

export function SBTPanel() {
  const { connected, walletAddress, setIsModalOpen } = useFlintWallet();

  const formattedSubject = connected && walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : "NOT CONNECTED";

  return (
    <section className="sbt-panel" aria-labelledby="sbt-title">
      <div className="sbt-panel-art">
        <HolographicSBT />
        <span className="sbt-art-code mono">METAPLEX CORE / L1</span>
      </div>
      <div className="sbt-panel-content">
        <SectionLabel code="ID / 005">Soulbound token</SectionLabel>
        <div className="sbt-panel-title-row">
          <h2 id="sbt-title">Proof of delivery.</h2>
          <BadgeCheck size={19} className="emerald-icon" />
        </div>
        <p>Non-transferable on-chain credentials on Solana that permanently bind execution history to the builder or agent that delivered it.</p>
        <dl className="sbt-facts">
          <div><dt>ISSUER</dt><dd className="mono">FLINT / REPUTATION L1</dd></div>
          <div><dt>SUBJECT</dt><dd className="mono">{formattedSubject}</dd></div>
          <div><dt>PROGRAM</dt><dd className="mono">J6JQJBVY...8AAWg</dd></div>
        </dl>
        <div className="sbt-panel-footer">
          <span><LockKeyhole size={13} /> NON-TRANSFERABLE (SOULBOUND)</span>
          {connected ? (
            <Link href="/passport" className="mono" style={{ color: "#FF6B00", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.75rem" }}>
              VIEW PASSPORT <ArrowRight size={12} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mono"
              style={{ background: "transparent", border: "none", color: "#FF6B00", cursor: "pointer", fontSize: "0.75rem" }}
            >
              CONNECT TO INSPECT →
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
