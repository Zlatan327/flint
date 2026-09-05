import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Award, CheckCircle2, ChevronUp, ExternalLink, FileCode, Figma, BookOpen, Database, Zap, Shield, ShieldCheck, UserCheck, Wallet, Sparkles } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { useFlintWallet } from "@/contexts/WalletContext";
import { defaultPassport, BuilderPassportData } from "@/lib/flint-data";

export default function BuilderPassportPage() {
  const { walletAddress, connected, setIsModalOpen } = useFlintWallet();
  const [passport] = useState<BuilderPassportData>(defaultPassport);

  const displayAddress = connected && walletAddress ? walletAddress : passport.address;
  const shortAddress = `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "DESIGN":
        return <Figma size={16} color="#FF6B00" />;
      case "RESEARCH":
        return <BookOpen size={16} color="#38bdf8" />;
      case "AI & DATA":
        return <Database size={16} color="#a855f7" />;
      case "OPERATIONS":
        return <Zap size={16} color="#eab308" />;
      default:
        return <FileCode size={16} color="#10b981" />;
    }
  };

  return (
    <div className="flint-app">
      <TopBar />

      <main className="subpage-main">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/exchange" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.45)", textDecoration: "none", fontSize: "0.78rem" }} className="mono">
            <ArrowLeft size={14} /> BACK TO GIG EXCHANGE
          </Link>
        </div>

        {/* Passport Profile Header */}
        <header className="category-header" style={{ marginBottom: "2rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.5rem" }}>
              <span className="category-kicker mono" style={{ margin: 0 }}>
                <span className="status-dot status-dot-live" /> PASSPORT / SBT-CORE · METAPLEX REPUTATION
              </span>
              <span className="mono" style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: "4px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
                VERIFIED OPERATOR
              </span>
            </div>
            <h1 style={{ fontSize: "2.4rem", margin: "0.2rem 0" }}>
              {passport.handle} <em style={{ color: "#FF6B00" }}>({shortAddress})</em>
            </h1>
            <p style={{ maxWidth: "680px", color: "rgba(255,255,255,0.65)", fontSize: "0.95rem" }}>
              Permanent cryptographic performance passport. Soulbound tokens (SBTs) are minted atomically upon L1 escrow settlement and cannot be transferred, faked, or manipulated.
            </p>
            <div className="category-actions" style={{ marginTop: "1.2rem" }}>
              <a
                className="amber-button mono"
                href="https://explorer.solana.com/address/J6JQJBVYB1ercx1rexHhAYYStaGWhx51YnEgbcr8AAWg?cluster=devnet"
                target="_blank"
                rel="noopener noreferrer"
              >
                REGISTRY CONTRACT <ExternalLink size={14} />
              </a>
              {!connected && (
                <button className="outline-button mono" onClick={() => setIsModalOpen(true)}>
                  CONNECT YOUR WALLET
                </button>
              )}
            </div>
          </div>

          {/* Builder Score Overview Card */}
          <aside className="category-summary category-summary-market" style={{ minWidth: "280px" }}>
            <Award size={20} color="#FF6B00" />
            <span className="metric-label">FLINT BUILDER SCORE</span>
            <strong className="mono" style={{ fontSize: "2.2rem", color: "#10b981" }}>
              {passport.builderScore} <span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.4)" }}>/ 100</span>
            </strong>
            <p>Calculated dynamically from delivery velocity, counterparty satisfaction, and dispute outcomes.</p>
            <div className="category-summary-foot mono" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div>
                <span style={{ color: "#888", display: "block", fontSize: "0.65rem" }}>ON-TIME RATE</span>
                <strong style={{ color: "#fff" }}>{passport.onTimeRate}%</strong>
              </div>
              <div>
                <span style={{ color: "#888", display: "block", fontSize: "0.65rem" }}>TOTAL EARNED</span>
                <strong style={{ color: "#FF6B00" }}>{passport.totalEarnedSol} SOL</strong>
              </div>
            </div>
          </aside>
        </header>

        {/* 4-Stat Strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "1rem" }}>
            <span className="metric-label" style={{ fontSize: "0.68rem" }}>SETTLED WORK ESCROWS</span>
            <div className="mono" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginTop: "4px" }}>
              {passport.completedGigs} GIGS
            </div>
            <span className="mono" style={{ fontSize: "0.68rem", color: "#10b981" }}>100% SUCCESS RATE</span>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "1rem" }}>
            <span className="metric-label" style={{ fontSize: "0.68rem" }}>SOULBOUND BADGES (SBT)</span>
            <div className="mono" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#FF6B00", marginTop: "4px" }}>
              {passport.soulboundTokens.length} ON-CHAIN
            </div>
            <span className="mono" style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)" }}>METAPLEX CORE ASSETS</span>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "1rem" }}>
            <span className="metric-label" style={{ fontSize: "0.68rem" }}>DISPUTE & SLASH HISTORY</span>
            <div className="mono" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#10b981", marginTop: "4px" }}>
              0 DISPUTES
            </div>
            <span className="mono" style={{ fontSize: "0.68rem", color: "#10b981" }}>0 LAMPORT SLASHED</span>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "1rem" }}>
            <span className="metric-label" style={{ fontSize: "0.68rem" }}>UNDERWRITING TRUST INDEX</span>
            <div className="mono" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#38bdf8", marginTop: "4px" }}>
              98.2%
            </div>
            <span className="mono" style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)" }}>PREDICTION MARKET BIAS</span>
          </div>
        </div>

        {/* Soulbound Tokens Grid */}
        <section style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <SectionLabel code="SBT / 001" tone="amber">Soulbound Credentials</SectionLabel>
              <h2 style={{ fontSize: "1.4rem", margin: "0.2rem 0" }}>Attested Metaplex Core Tokens</h2>
            </div>
            <span className="mono" style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
              IMMUTABLE & NON-TRANSFERABLE
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
            {passport.soulboundTokens.map((sbt) => (
              <article
                key={sbt.mint}
                style={{
                  background: "rgba(10, 12, 16, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {getCategoryIcon(sbt.category)}
                      <span className="mono" style={{ fontSize: "0.65rem", padding: "2px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", color: "#fff" }}>
                        {sbt.category}
                      </span>
                    </div>
                    <span className="mono" style={{ fontSize: "0.68rem", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle2 size={13} /> ON-TIME ({sbt.score}/100)
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.5rem", color: "#fff" }}>{sbt.name}</h3>
                  <div className="mono" style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", display: "flex", gap: "12px" }}>
                    <span>GIG: {sbt.gigId}</span>
                    <span>EARNED: {sbt.amountSol} SOL</span>
                    <span>DATE: {sbt.earnedDate}</span>
                  </div>
                </div>

                <div style={{ paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="mono" style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>
                    MINT: {sbt.mint}
                  </span>
                  <a
                    href={`https://explorer.solana.com/address/J6JQJBVYB1ercx1rexHhAYYStaGWhx51YnEgbcr8AAWg?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono"
                    style={{ fontSize: "0.7rem", color: "#38bdf8", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    EXPLORER <ExternalLink size={12} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Two-Column Supporting Stage: Skill Distribution & Telemetry Verification */}
        <div className="market-support-grid" style={{ marginBottom: "2rem" }}>
          {/* Skill Distribution */}
          <div style={{ background: "rgba(10, 12, 16, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "1.5rem" }}>
            <SectionLabel code="PRF / 002" tone="emerald">Cross-Discipline Competency</SectionLabel>
            <h2 style={{ fontSize: "1.2rem", margin: "0.3rem 0 1rem" }}>Verified Competency Radar</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {passport.skills.map((skill) => (
                <div key={skill.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.8rem" }}>
                    <span style={{ color: "#fff", fontWeight: 600 }}>{skill.name}</span>
                    <span className="mono" style={{ color: "#FF6B00" }}>{skill.level}%</span>
                  </div>
                  <div style={{ width: "100%", height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${skill.level}%`, height: "100%", background: "#FF6B00" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry & Sybil Proofs */}
          <div style={{ background: "rgba(10, 12, 16, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "1.5rem" }}>
            <SectionLabel code="TEL / 003" tone="amber">Anti-Sybil Proofs</SectionLabel>
            <h2 style={{ fontSize: "1.2rem", margin: "0.3rem 0 1rem" }}>Identity & L1 Proof Checks</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {passport.telemetryChecks.map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ShieldCheck size={16} color="#10b981" />
                    <span className="mono" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)" }}>{item.label}</span>
                  </div>
                  <span className="mono" style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 600 }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-mark brand-mark-small" aria-hidden="true">
            <span className="brand-mark-cut" />
          </span>
          <span className="brand-name">FLINT</span>
          <span className="mono">REPUTATION / V1</span>
        </div>
        <div className="footer-links">
          <Link href="/exchange"><Shield size={13} /> GIG EXCHANGE</Link>
          <Link href="/markets"><Award size={13} /> PREDICTION MARKET</Link>
          <a href="https://explorer.solana.com/address/J6JQJBVYB1ercx1rexHhAYYStaGWhx51YnEgbcr8AAWg?cluster=devnet" target="_blank" rel="noreferrer">
            <ExternalLink size={13} /> SBT REGISTRY
          </a>
        </div>
        <a className="back-top mono" href="#top">BACK TO TOP <ChevronUp size={13} /></a>
      </footer>
    </div>
  );
}
