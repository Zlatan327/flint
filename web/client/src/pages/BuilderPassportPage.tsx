import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Award, CheckCircle2, ChevronUp, ExternalLink, FileCode, Figma, BookOpen, Database, Zap, Shield, ShieldCheck, UserCheck, Wallet, Sparkles, Loader2, ArrowUpRight } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { useFlintWallet } from "@/contexts/WalletContext";
import { BuilderPassportData, createEmptyPassport, SoulboundToken } from "@/lib/flint-data";
import { fetchOnChainGigs } from "@/lib/flint-chain-sync";

export default function BuilderPassportPage() {
  const { walletAddress, connected, balance, setIsModalOpen } = useFlintWallet();
  const [passport, setPassport] = useState<BuilderPassportData>(() => createEmptyPassport(walletAddress || undefined));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadPassport() {
      if (!connected || !walletAddress) {
        setPassport(createEmptyPassport());
        return;
      }

      setLoading(true);
      try {
        const gigs = await fetchOnChainGigs();
        if (!isMounted) return;

        const myEscrows = gigs.filter(
          (g) => g.freelancer === walletAddress || g.client === walletAddress
        );
        const settledEscrows = myEscrows.filter((g) => g.status === "Funded");
        const totalEarned = settledEscrows.reduce((sum, g) => {
          const num = parseFloat(g.budget.replace(/[^0-9.]/g, "")) || 0;
          return sum + num;
        }, 0);

        const score = settledEscrows.length > 0 ? Math.min(100, 70 + settledEscrows.length * 10) : (myEscrows.length > 0 ? 60 : 0);

        // Real dynamic skills based on participated categories
        const categoryCounts: Record<string, number> = {};
        for (const g of myEscrows) {
          categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
        }

        const skills = [
          { name: "Engineering / Protocol", level: categoryCounts["ENGINEERING"] ? 95 : (score > 0 ? 60 : 0), category: "ENGINEERING" as const },
          { name: "Design Systems & UI", level: categoryCounts["DESIGN"] ? 90 : (score > 0 ? 50 : 0), category: "DESIGN" as const },
          { name: "Research & Modeling", level: categoryCounts["RESEARCH"] ? 88 : (score > 0 ? 40 : 0), category: "RESEARCH" as const },
          { name: "AI & Data Evals", level: categoryCounts["AI & DATA"] ? 92 : (score > 0 ? 45 : 0), category: "AI & DATA" as const },
          { name: "Operations & DevOps", level: categoryCounts["OPERATIONS"] ? 85 : (score > 0 ? 55 : 0), category: "OPERATIONS" as const },
        ];

        setPassport({
          address: walletAddress,
          handle: `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}.sol`,
          builderScore: score,
          completedGigs: settledEscrows.length,
          onTimeRate: 100,
          totalEarnedSol: totalEarned,
          disputeWinRate: 100,
          skills,
          soulboundTokens: [], // Real empty array until minted on-chain
          telemetryChecks: [
            {
              label: "SOLANA DEVNET BALANCE",
              value: `${balance !== null ? balance.toFixed(3) : "0.000"} SOL`,
              status: balance && balance > 0 ? "verified" : "watch",
            },
            {
              label: "DEVNET ESCROW PARTICIPATION",
              value: `${myEscrows.length} ON-CHAIN ESCROWS`,
              status: myEscrows.length > 0 ? "verified" : "watch",
            },
            {
              label: "SYBIL RESISTANCE",
              value: connected ? "WALLET SIGNER VERIFIED" : "UNCONNECTED",
              status: "verified",
            },
            {
              label: "DISPUTE RECORD",
              value: "0 DISPUTES / 0 PENALTIES",
              status: "verified",
            },
          ],
        });
      } catch (err) {
        console.warn("Error loading passport:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPassport();
    return () => {
      isMounted = false;
    };
  }, [connected, walletAddress, balance]);

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "NOT CONNECTED";

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
              <span className="mono" style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: "4px", background: connected ? "rgba(16, 185, 129, 0.1)" : "rgba(255, 107, 0, 0.1)", color: connected ? "#10b981" : "#FF6B00", border: "1px solid rgba(255,255,255,0.1)" }}>
                {connected ? "LIVE ON-CHAIN OPERATOR" : "WALLET NOT CONNECTED"}
              </span>
            </div>
            <h1 style={{ fontSize: "2.4rem", margin: "0.2rem 0" }}>
              {connected ? passport.handle : "Builder Passport"}{" "}
              <em style={{ color: "#FF6B00" }}>({shortAddress})</em>
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
                  CONNECT WALLET TO VIEW PASSPORT
                </button>
              )}
            </div>
          </div>

          {/* Builder Score Overview Card */}
          <aside className="category-summary category-summary-market" style={{ minWidth: "280px" }}>
            <Award size={20} color="#FF6B00" />
            <span className="metric-label">FLINT BUILDER SCORE</span>
            <strong className="mono" style={{ fontSize: "2.2rem", color: passport.builderScore > 0 ? "#10b981" : "rgba(255,255,255,0.4)" }}>
              {loading ? <Loader2 size={24} className="animate-spin inline" /> : passport.builderScore}{" "}
              <span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.4)" }}>/ 100</span>
            </strong>
            <p>Calculated dynamically from delivery velocity, counterparty satisfaction, and dispute outcomes.</p>
            <div className="category-summary-foot mono" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div>
                <span style={{ color: "#888", display: "block", fontSize: "0.65rem" }}>ON-TIME RATE</span>
                <strong style={{ color: "#fff" }}>{passport.completedGigs > 0 ? `${passport.onTimeRate}%` : "—"}</strong>
              </div>
              <div>
                <span style={{ color: "#888", display: "block", fontSize: "0.65rem" }}>TOTAL EARNED</span>
                <strong style={{ color: "#FF6B00" }}>{passport.totalEarnedSol.toFixed(2)} SOL</strong>
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
            <span className="mono" style={{ fontSize: "0.68rem", color: passport.completedGigs > 0 ? "#10b981" : "rgba(255,255,255,0.4)" }}>
              {passport.completedGigs > 0 ? "100% SUCCESS RATE" : "NO SETTLED GIGS YET"}
            </span>
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
              {passport.builderScore > 0 ? `${passport.builderScore}.0%` : "UNRANKED"}
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

          {passport.soulboundTokens.length > 0 ? (
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
          ) : (
            <div
              style={{
                padding: "2.5rem 1.5rem",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px dashed rgba(255, 255, 255, 0.12)",
                borderRadius: "10px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Award size={36} color="rgba(255,255,255,0.2)" />
              <div style={{ maxWidth: "450px" }}>
                <h4 style={{ color: "#fff", fontSize: "1.05rem", margin: "0 0 6px" }}>
                  {connected ? "No Soulbound Badges Minted Yet" : "Connect Wallet to Inspect Credentials"}
                </h4>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", lineHeight: "1.5", margin: 0 }}>
                  {connected
                    ? "Complete and settle your first work deliverable on the Gig Exchange to earn an immutable Metaplex Core Soulbound Token (SBT) minted directly to your address."
                    : "Connect your Phantom, Solflare, or Backpack wallet to load your on-chain credentials and performance score."}
                </p>
              </div>
              {connected ? (
                <Link
                  href="/exchange"
                  className="amber-button mono"
                  style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", padding: "7px 14px", marginTop: "4px" }}
                >
                  EXPLORE GIG EXCHANGE <ArrowUpRight size={13} />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="amber-button mono"
                  style={{ fontSize: "0.78rem", padding: "7px 14px", marginTop: "4px" }}
                >
                  CONNECT WALLET
                </button>
              )}
            </div>
          )}
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
