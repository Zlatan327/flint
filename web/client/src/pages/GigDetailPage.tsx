import { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Award, CheckCircle2, ChevronUp, Clock, ExternalLink, FileCode, Figma, BookOpen, Database, Zap, Shield, ShieldCheck, AlertTriangle, Send, Wallet, Loader2, Plus, Sparkles, TrendingUp } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { useFlintWallet } from "@/contexts/WalletContext";
import { Gig } from "@/lib/flint-data";
import { fetchOnChainGigs } from "@/lib/flint-chain-sync";
import { SubmitWorkModal } from "@/components/workspaces/SubmitWorkModal";
import { DeliverableReviewModal } from "@/components/workspaces/DeliverableReviewModal";
import { placeMarketOrderOnChain, fetchOnChainMarkets, createMarketOnChain } from "@/lib/flint-market-client";
import { PublicKey } from "@solana/web3.js";

export default function GigDetailPage() {
  const [, params] = useRoute("/gig/:id");
  const gigId = params?.id || "";
  const { connected, walletAddress, setIsModalOpen } = useFlintWallet();

  const [currentGig, setCurrentGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Prediction market state for this specific gig
  const [matchedMarket, setMatchedMarket] = useState<any | null>(null);
  const [creatingMarket, setCreatingMarket] = useState(false);
  const [betSide, setBetSide] = useState<"YES" | "NO">("YES");
  const [stakeSol, setStakeSol] = useState("0.1");
  const [trading, setTrading] = useState(false);
  const [tradeTx, setTradeTx] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadGig() {
      setLoading(true);
      try {
        const [onChainGigs, markets] = await Promise.all([
          fetchOnChainGigs().catch(() => []),
          fetchOnChainMarkets().catch(() => []),
        ]);
        if (!isMounted) return;
        const found = onChainGigs.find(
          (g) => g.id === gigId || g.pda === gigId || `GIG-${(g as any).gigId}` === gigId
        );
        setCurrentGig(found || null);

        const rawNum = parseInt(gigId.replace(/[^0-9]/g, ""), 10) || (found ? parseInt(found.id.replace(/[^0-9]/g, ""), 10) : 0);
        const match = markets.find((m) => m.gigId === rawNum || (found && m.gigId === (found as any).gigId));
        setMatchedMarket(match || null);
      } catch (err) {
        console.warn("Failed to load gig or markets:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadGig();
    return () => {
      isMounted = false;
    };
  }, [gigId]);

  const getFormatIcon = (category: string) => {
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

  const handleWorkSubmitted = (id: string, url: string, deliverableType?: any, notes?: string, hashHex?: string) => {
    setCurrentGig((prev) => prev ? ({
      ...prev,
      status: "Reviewing",
      submissions: (prev.submissions || 0) + 1,
      deliverableUrl: url,
      deliverableType: deliverableType || prev.deliverableType,
      deliverableNotes: notes,
      deliverableHash: hashHex,
    }) : null);
    setIsSubmitModalOpen(false);
  };

  const handleSettled = () => {
    setCurrentGig((prev) => prev ? ({
      ...prev,
      status: "Funded",
    }) : null);
    setIsReviewModalOpen(false);
  };

  const handleDisputed = (_gigId: string, _txSig: string) => {
    setCurrentGig((prev) => prev ? ({
      ...prev,
      status: "Disputed",
    }) : null);
  };

  const handleCreateMarketForGig = async () => {
    if (!connected || !walletAddress) {
      setIsModalOpen(true);
      return;
    }

    const rawNum = parseInt(gigId.replace(/[^0-9]/g, ""), 10) || (currentGig ? parseInt(currentGig.id.replace(/[^0-9]/g, ""), 10) : 0);
    if (!rawNum) {
      alert("Invalid numeric gig ID for prediction market.");
      return;
    }

    setCreatingMarket(true);
    try {
      const win = window as any;
      const provider = win.okxwallet?.solana || win.phantom?.solana || win.solflare || win.backpack || win.solana;
      if (!provider) throw new Error("No Solana browser wallet detected.");

      const marketId = Math.floor(1000 + Math.random() * 9000);
      const targetTimestamp = Math.floor(Date.now() / 1000) + 7 * 86400;

      const result = await createMarketOnChain(
        {
          marketId,
          gigId: rawNum,
          marketType: 0,
          targetTimestamp,
          authority: new PublicKey(walletAddress),
        },
        provider
      );

      setTradeTx(result.txSignature);
      const markets = await fetchOnChainMarkets();
      const match = markets.find((m) => m.gigId === rawNum);
      setMatchedMarket(match || null);
    } catch (err: any) {
      console.error("Market creation failed:", err);
      alert(`Deployment failed: ${err?.message || "Transaction rejected"}`);
    } finally {
      setCreatingMarket(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!connected || !walletAddress) {
      setIsModalOpen(true);
      return;
    }

    setTrading(true);
    try {
      const win = window as any;
      const provider = win.okxwallet?.solana || win.phantom?.solana || win.solflare || win.backpack || win.solana;
      if (!provider) throw new Error("No Solana wallet detected.");

      const mktId = matchedMarket ? matchedMarket.marketId : (parseInt(gigId.replace(/[^0-9]/g, ""), 10) || 1);
      const result = await placeMarketOrderOnChain(
        {
          marketId: mktId,
          isYes: betSide === "YES",
          amountSol: parseFloat(stakeSol) || 0.1,
          traderPubkey: new PublicKey(walletAddress),
        },
        provider
      );
      setTradeTx(result.txSignature);
      const markets = await fetchOnChainMarkets();
      const rawNum = parseInt(gigId.replace(/[^0-9]/g, ""), 10);
      const match = markets.find((m) => m.gigId === rawNum);
      setMatchedMarket(match || null);
    } catch (err: any) {
      console.error("Order failed:", err);
      alert(`Trade error: ${err?.message || "Transaction rejected"}`);
    } finally {
      setTrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flint-app">
        <TopBar />
        <main className="subpage-main" style={{ textAlign: "center", padding: "6rem 2rem" }}>
          <Loader2 size={36} className="animate-spin inline text-amber-500 mb-4" />
          <h2 style={{ color: "#fff", fontSize: "1.2rem" }}>Loading On-Chain Escrow...</h2>
          <p className="mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem" }}>
            Querying Solana Devnet RPC for {gigId}
          </p>
        </main>
      </div>
    );
  }

  if (!currentGig) {
    return (
      <div className="flint-app">
        <TopBar />
        <main className="subpage-main" style={{ textAlign: "center", padding: "6rem 2rem" }}>
          <AlertTriangle size={40} color="#f59e0b" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ color: "#fff", fontSize: "1.3rem", margin: "0 0 0.5rem" }}>Gig Not Found on Solana Devnet</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: "480px", margin: "0 auto 1.5rem", fontSize: "0.88rem" }}>
            The escrow account for &ldquo;{gigId}&rdquo; was not found among active program accounts on Devnet. It may have already been closed or settled.
          </p>
          <Link href="/exchange" className="amber-button mono" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <ArrowLeft size={14} /> RETURN TO GIG EXCHANGE
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flint-app">
      <TopBar />

      <main className="subpage-main">
        {/* Back Link */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/exchange" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.45)", textDecoration: "none", fontSize: "0.78rem" }} className="mono">
            <ArrowLeft size={14} /> BACK TO GIG EXCHANGE
          </Link>
        </div>

        {/* Gig Header */}
        <header className="category-header" style={{ marginBottom: "2rem" }}>
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
              <span className="mono" style={{ fontSize: "0.72rem", color: "#FF6B00", fontWeight: 700 }}>
                {currentGig.id}
              </span>
              <span className="mono" style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", color: "#fff", display: "flex", alignItems: "center", gap: "5px" }}>
                {getFormatIcon(currentGig.category)} {currentGig.category}
              </span>
              <span
                className="mono"
                style={{
                  fontSize: "0.68rem",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: currentGig.status === "Disputed" ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.1)",
                  color: currentGig.status === "Disputed" ? "#ef4444" : "#10b981",
                  border: currentGig.status === "Disputed" ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(16, 185, 129, 0.25)",
                }}
              >
                {currentGig.status.toUpperCase()}
              </span>
              <span className="mono" style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.45)" }}>
                {currentGig.lane} · {currentGig.verification}
              </span>
            </div>

            <h1 style={{ fontSize: "2.2rem", margin: "0.2rem 0 0.8rem", color: "#fff" }}>
              {currentGig.title}
            </h1>

            <p style={{ maxWidth: "680px", color: "rgba(255,255,255,0.75)", fontSize: "0.95rem", lineHeight: "1.5" }}>
              {currentGig.description || "Decentralized labor escrow locked in Solana Devnet Vault PDA. Deliverables require cryptographic proof commitment before payout release."}
            </p>
          </div>

          {/* Escrow Status Summary Card */}
          <aside className="category-summary category-summary-market" style={{ minWidth: "260px" }}>
            <ShieldCheck size={20} color="#10b981" />
            <span className="metric-label">ESCROW BUDGET</span>
            <strong className="mono" style={{ fontSize: "2.2rem", color: "#fff" }}>
              {currentGig.budget}
            </strong>
            <p>Vault custody established. Funds cannot be seized or withdrawn without review or dispute.</p>
            <div className="category-summary-foot mono">
              <span>CLOSES {currentGig.deadline}</span>
              <span>{currentGig.submissions} SUBMISSIONS</span>
            </div>
          </aside>
        </header>

        {/* Two-Column Detail Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
          {/* Left Column: Specifications, Proof & PDA Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Acceptance Criteria */}
            <div style={{ background: "rgba(10, 12, 16, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "1.5rem" }}>
              <SectionLabel code="REQ / 001" tone="amber">Deliverable Requirements</SectionLabel>
              <h2 style={{ fontSize: "1.2rem", margin: "0.3rem 0 0.75rem" }}>Quality Acceptance Criteria</h2>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.88rem", lineHeight: "1.5" }}>
                {currentGig.acceptanceCriteria || "Deliverable must adhere strictly to the project brief. Worker must submit verifiable URL (Figma, GitHub, Notion, or Dataset) which is sealed as a 32-byte cryptographic SHA-256 hash into the escrow state."}
              </p>

              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span className="mono" style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>ACCEPTED FORMAT:</span>
                <span className="mono" style={{ fontSize: "0.8rem", color: "#38bdf8" }}>
                  {currentGig.deliverableType || "Figma / GitHub PR / Research Doc / AI Dataset"}
                </span>
              </div>
            </div>

            {/* Solana On-Chain Custody */}
            <div style={{ background: "rgba(10, 12, 16, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "1.5rem" }}>
              <SectionLabel code="L1 / 002" tone="emerald">On-Chain Protocol State</SectionLabel>
              <h2 style={{ fontSize: "1.2rem", margin: "0.3rem 0 0.75rem" }}>Solana Program Accounts</h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }} className="mono">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                  <span style={{ color: "#888" }}>ESCROW CONTRACT:</span>
                  <a
                    href="https://explorer.solana.com/address/2PQbtiG8dxUqr2jSX1RfxiJnXutndhGkHm9k4YrKQD6h?cluster=devnet"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#38bdf8", textDecoration: "none" }}
                  >
                    2PQbti...QD6h ↗
                  </a>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                  <span style={{ color: "#888" }}>VAULT PDA CUSTODY:</span>
                  <span style={{ color: "#10b981" }}>SOL LOCKED ({currentGig.budget})</span>
                </div>

                {currentGig.deliverableHash && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingTop: "6px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ color: "#888", fontSize: "0.68rem" }}>DELIVERABLE COMMITMENT HASH:</span>
                    <span style={{ color: "#FF6B00", fontSize: "0.7rem", wordBreak: "break-all" }}>
                      {currentGig.deliverableHash}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Primary Action Section */}
            <div style={{ background: "rgba(10, 12, 16, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "1.5rem" }}>
              <SectionLabel code="ACT / 003">Worker & Requester Actions</SectionLabel>
              <h2 style={{ fontSize: "1.2rem", margin: "0.3rem 0 1rem" }}>Execution Controls</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {currentGig.status === "Accepting" && (
                  <button
                    className="amber-button mono"
                    style={{ width: "100%", padding: "0.85rem", fontSize: "0.9rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
                    onClick={() => connected ? setIsSubmitModalOpen(true) : setIsModalOpen(true)}
                  >
                    <Send size={16} /> SUBMIT WORK DELIVERABLE
                  </button>
                )}

                {currentGig.status === "Reviewing" && (
                  <button
                    className="emerald-button mono"
                    style={{ width: "100%", padding: "0.85rem", fontSize: "0.9rem", background: "#FF6B00", color: "#000", fontWeight: 700, border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
                    onClick={() => setIsReviewModalOpen(true)}
                  >
                    <ShieldCheck size={16} /> INSPECT DELIVERABLE & RELEASE FUNDS
                  </button>
                )}

                {currentGig.status === "Disputed" && (
                  <button
                    className="mono"
                    style={{
                      width: "100%",
                      padding: "0.85rem",
                      fontSize: "0.9rem",
                      background: "rgba(239, 68, 68, 0.15)",
                      color: "#ef4444",
                      fontWeight: 700,
                      border: "1px solid rgba(239, 68, 68, 0.35)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onClick={() => setIsReviewModalOpen(true)}
                  >
                    <AlertTriangle size={16} /> INSPECT DISPUTE & ESCROW AUDIT
                  </button>
                )}

                {currentGig.status === "Funded" && (
                  <div style={{ padding: "12px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "8px", color: "#10b981", textAlign: "center" }} className="mono">
                    <CheckCircle2 size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                    Escrow Settled & Completed on Devnet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Embedded Delivery Prediction Market Mini-Book */}
          <div>
            <div style={{ background: "rgba(10, 12, 16, 0.8)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <SectionLabel code="MKT / UNDERWRITE" tone="amber">Performance Insurance</SectionLabel>
                <span className="mono" style={{ fontSize: "0.68rem", color: "#10b981" }}>DEVNET L1</span>
              </div>
              
              <h2 style={{ fontSize: "1.3rem", margin: "0 0 0.5rem" }}>Underwrite Delivery Risk</h2>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.82rem", lineHeight: "1.4", margin: "0 0 1.25rem" }}>
                Stake Devnet SOL on whether this gig milestone ships on-time and passes verification. Real capital underwriting creates crowd-sourced performance insurance.
              </p>

              {matchedMarket ? (
                <>
                  {/* Live On-Chain Odds Meter */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "14px", marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="mono" style={{ fontSize: "0.72rem", color: "#888" }}>DELIVERY PROBABILITY</span>
                        <span className="mono" style={{ fontSize: "0.62rem", background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "1px 5px", borderRadius: "3px" }}>LIVE ON-CHAIN</span>
                      </div>
                      <strong className="mono" style={{ fontSize: "1.2rem", color: "#10b981" }}>{matchedMarket.probability}%</strong>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${matchedMarket.probability}%`, height: "100%", background: "#10b981" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "0.7rem" }} className="mono">
                      <span style={{ color: "#10b981" }}>YES POOL: {matchedMarket.yesPoolSol.toFixed(2)} SOL</span>
                      <span style={{ color: "#f43f5e" }}>NO POOL: {matchedMarket.noPoolSol.toFixed(2)} SOL</span>
                    </div>
                  </div>

                  {matchedMarket.isResolved ? (
                    <div style={{ padding: "14px", background: matchedMarket.winningOutcome ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)", border: `1px solid ${matchedMarket.winningOutcome ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.25)"}`, borderRadius: "8px", textAlign: "center" }} className="mono">
                      <CheckCircle2 size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px", color: matchedMarket.winningOutcome ? "#10b981" : "#f43f5e" }} />
                      <strong style={{ color: matchedMarket.winningOutcome ? "#10b981" : "#f43f5e", fontSize: "0.85rem" }}>
                        MARKET RESOLVED ON-CHAIN: {matchedMarket.winningOutcome ? "YES (DELIVERED)" : "NO (FAILED)"}
                      </strong>
                    </div>
                  ) : (
                    /* Buy Form */
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => setBetSide("YES")}
                          style={{
                            padding: "10px",
                            borderRadius: "6px",
                            border: betSide === "YES" ? "2px solid #10b981" : "1px solid rgba(255,255,255,0.1)",
                            background: betSide === "YES" ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.02)",
                            color: betSide === "YES" ? "#10b981" : "rgba(255,255,255,0.6)",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontSize: "0.85rem",
                          }}
                          className="mono"
                        >
                          BUY YES ({matchedMarket.probability}%)
                        </button>
                        <button
                          type="button"
                          onClick={() => setBetSide("NO")}
                          style={{
                            padding: "10px",
                            borderRadius: "6px",
                            border: betSide === "NO" ? "2px solid #f43f5e" : "1px solid rgba(255,255,255,0.1)",
                            background: betSide === "NO" ? "rgba(244, 63, 94, 0.15)" : "rgba(255,255,255,0.02)",
                            color: betSide === "NO" ? "#f43f5e" : "rgba(255,255,255,0.6)",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontSize: "0.85rem",
                          }}
                          className="mono"
                        >
                          BUY NO ({100 - matchedMarket.probability}%)
                        </button>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }} className="mono">
                          STAKE AMOUNT (SOL)
                        </label>
                        <div style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                          {[0.05, 0.1, 0.5, 1.0].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setStakeSol(String(amt))}
                              style={{
                                padding: "3px 8px",
                                borderRadius: "4px",
                                fontSize: "0.7rem",
                                fontFamily: "monospace",
                                background: parseFloat(stakeSol) === amt ? "#FF6B00" : "rgba(255,255,255,0.05)",
                                color: parseFloat(stakeSol) === amt ? "#000" : "rgba(255,255,255,0.8)",
                                fontWeight: parseFloat(stakeSol) === amt ? 700 : 500,
                                border: "1px solid rgba(255,255,255,0.1)",
                                cursor: "pointer",
                              }}
                            >
                              {amt}
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          step="0.05"
                          min="0.01"
                          disabled={trading}
                          value={stakeSol}
                          onChange={(e) => setStakeSol(e.target.value)}
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "#fff",
                            padding: "0.6rem",
                            borderRadius: "6px",
                            outline: "none",
                          }}
                          className="mono"
                        />
                      </div>

                      {tradeTx && (
                        <div style={{ padding: "8px 10px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "6px", fontSize: "0.72rem", color: "#10b981" }} className="mono">
                          Order confirmed! <a href={`https://explorer.solana.com/tx/${tradeTx}?cluster=devnet`} target="_blank" rel="noreferrer" style={{ color: "#38bdf8" }}>Explorer ↗</a>
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={trading}
                        onClick={handlePlaceOrder}
                        style={{
                          padding: "0.8rem",
                          borderRadius: "6px",
                          background: betSide === "YES" ? "#10b981" : "#f43f5e",
                          color: "#000",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          cursor: trading ? "not-allowed" : "pointer",
                        }}
                        className="mono"
                      >
                        {trading ? "EXECUTING ON DEVNET..." : `CONFIRM ${betSide} ORDER (${stakeSol} SOL)`}
                      </button>
                    </div>
                  )}

                  <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="mono">
                    <span style={{ fontSize: "0.7rem", color: "#888" }}>MARKET PDA:</span>
                    <Link href="/markets" style={{ color: "#FF6B00", fontSize: "0.72rem", textDecoration: "none" }}>
                      OPEN FULL ORDER BOOK ↗
                    </Link>
                  </div>
                </>
              ) : (
                /* No Market Initialized State */
                <div style={{ padding: "1.5rem 1rem", textAlign: "center", border: "1px dashed rgba(255,255,255,0.12)", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <TrendingUp size={28} color="rgba(255,255,255,0.3)" />
                  <div>
                    <h4 style={{ color: "#fff", margin: "0 0 4px", fontSize: "0.95rem" }}>No Active Market for Gig #{gigId}</h4>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", lineHeight: "1.4", margin: 0 }}>
                      Initialize a prediction market on Solana Devnet to let underwriters stake real capital on this milestone deliverable.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={creatingMarket}
                    onClick={handleCreateMarketForGig}
                    className="amber-button mono"
                    style={{ fontSize: "0.78rem", padding: "8px 16px", marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    {creatingMarket ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                    {creatingMarket ? "INITIALIZING ON SOLANA DEVNET..." : "OPEN PREDICTION MARKET FOR THIS GIG"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <SubmitWorkModal
        isOpen={isSubmitModalOpen}
        gig={currentGig}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={handleWorkSubmitted}
      />

      <DeliverableReviewModal
        isOpen={isReviewModalOpen}
        gig={currentGig}
        onClose={() => setIsReviewModalOpen(false)}
        onSettled={handleSettled}
        onDisputed={handleDisputed}
      />

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-mark brand-mark-small" aria-hidden="true">
            <span className="brand-mark-cut" />
          </span>
          <span className="brand-name">FLINT</span>
          <span className="mono">GIG / {currentGig.id}</span>
        </div>
        <div className="footer-links">
          <Link href="/exchange"><Shield size={13} /> GIG EXCHANGE</Link>
          <Link href="/markets"><Award size={13} /> PREDICTION MARKET</Link>
          <Link href="/passport"><CheckCircle2 size={13} /> BUILDER PASSPORT</Link>
        </div>
        <a className="back-top mono" href="#top">BACK TO TOP <ChevronUp size={13} /></a>
      </footer>
    </div>
  );
}
