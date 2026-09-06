import { gigs, GigCategory } from "@/lib/flint-data";
import { ArrowUpRight, Filter, Plus, ExternalLink, CheckCircle2, Loader2, FileCode, Figma, BookOpen, Database, Zap } from "lucide-react";
import { useFlintWallet } from "@/contexts/WalletContext";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { PostGigModal } from "./PostGigModal";
import { SubmitWorkModal } from "./SubmitWorkModal";
import { DeliverableReviewModal } from "./DeliverableReviewModal";
import { useState, useEffect } from "react";
import { EscrowTxResult, settleEscrowOnChain } from "@/lib/flint-escrow-client";
import { fetchOnChainGigs, saveGigMetadata } from "@/lib/flint-chain-sync";
import { PublicKey } from "@solana/web3.js";
import { Link } from "wouter";

export function GigExchange() {
  const { connected, walletAddress, setIsModalOpen } = useFlintWallet();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedGigForSubmission, setSelectedGigForSubmission] = useState<any | null>(null);
  const [selectedGigForReview, setSelectedGigForReview] = useState<any | null>(null);
  const [gigList, setGigList] = useState<any[]>([]);
  const [loadingOnChain, setLoadingOnChain] = useState(true);
  const [settlingGigId, setSettlingGigId] = useState<string | null>(null);

  // Filter state
  const [filterDomain, setFilterDomain] = useState("ALL");
  const [filterModel, setFilterModel] = useState("ALL");
  const [filterLane, setFilterLane] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Fetch live on-chain gigs from Solana Devnet on mount
  useEffect(() => {
    let isMounted = true;
    async function loadLiveGigs() {
      setLoadingOnChain(true);
      try {
        const onChainGigs = await fetchOnChainGigs();
        if (isMounted) {
          setGigList(onChainGigs);
        }
      } catch (err) {
        console.warn("Failed to load on-chain gigs:", err);
      } finally {
        if (isMounted) setLoadingOnChain(false);
      }
    }
    loadLiveGigs();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleInteract = (action: string, gig: any) => {
    if (!connected) return setIsModalOpen(true);
    if (action === "submit") {
      setSelectedGigForSubmission(gig);
    } else if (action === "view_escrow") {
      const url = gig.pda
        ? `https://explorer.solana.com/address/${gig.pda}?cluster=devnet`
        : `https://explorer.solana.com/address/2PQbtiG8dxUqr2jSX1RfxiJnXutndhGkHm9k4YrKQD6h?cluster=devnet`;
      window.open(url, "_blank");
    }
  };

  const handleSettle = async (gig: any) => {
    if (!connected || !walletAddress) return setIsModalOpen(true);
    if (!gig.pda) return alert("This gig does not have a valid on-chain PDA.");

    try {
      setSettlingGigId(gig.id);
      const win = window as any;
      const provider = win.okxwallet?.solana || win.phantom?.solana || win.solflare || win.backpack || win.solana;
      if (!provider) throw new Error("No Solana browser wallet detected.");

      const freelancerTarget = gig.freelancer || walletAddress;
      const txSig = await settleEscrowOnChain(
        gig.pda,
        freelancerTarget,
        new PublicKey(walletAddress),
        provider
      );

      alert(`Escrow settled successfully on Devnet!\nTx: ${txSig}`);
      // Mark as Completed/Funded locally
      setGigList((prev) =>
        prev.map((g) => (g.id === gig.id ? { ...g, status: "Funded" as const } : g))
      );
    } catch (err: any) {
      console.error("Settlement error:", err);
      alert(`Settlement failed: ${err?.message || "Transaction rejected"}`);
    } finally {
      setSettlingGigId(null);
    }
  };

  const handleWorkSubmitted = (gigId: string, url: string, deliverableType?: any, notes?: string, hashHex?: string) => {
    setGigList((prev) =>
      prev.map((g) =>
        g.id === gigId
          ? {
              ...g,
              status: "Reviewing" as const,
              submissions: (g.submissions || 0) + 1,
              deliverableUrl: url,
              deliverableType: deliverableType || g.deliverableType,
              deliverableNotes: notes,
              deliverableHash: hashHex,
            }
          : g
      )
    );
    setSelectedGigForSubmission(null);
  };

  const handleSettled = (gigId: string, _txSig: string) => {
    setGigList((prev) =>
      prev.map((g) => (g.id === gigId ? { ...g, status: "Funded" as const } : g))
    );
    setSelectedGigForReview(null);
  };

  const handleDisputed = (gigId: string, _txSig: string) => {
    setGigList((prev) =>
      prev.map((g) => (g.id === gigId ? { ...g, status: "Disputed" as const } : g))
    );
  };

  const handleGigCreated = (result: EscrowTxResult, gigData: any) => {
    saveGigMetadata(result.gigId, result.gigEscrowPda, {
      title: gigData.title,
      category: gigData.category,
      lane: gigData.lane,
      description: gigData.description,
      acceptanceCriteria: gigData.acceptanceCriteria,
    });

    const newGig = {
      id: `GIG-${result.gigId}`,
      title: gigData.title,
      category: gigData.category || "ENGINEERING",
      description: gigData.description,
      lane: gigData.lane,
      budget: gigData.budget,
      status: "Accepting" as const,
      verification: gigData.model === "Bounty" ? "COMMIT-REVEAL" : "CONTEST",
      deadline: "7D 00H",
      submissions: 0,
      pda: result.gigEscrowPda,
      vault: result.vaultPda,
      client: walletAddress || undefined,
      txSignature: result.txSignature,
    };
    setGigList((prev) => [newGig, ...prev]);
  };

  const filteredGigs = gigList.filter((g) => {
    if (filterDomain !== "ALL" && g.category !== filterDomain) return false;
    if (filterModel === "BOUNTY" && !g.verification.includes("COMMIT")) return false;
    if (filterModel === "CONTEST" && !g.verification.includes("CONTEST")) return false;
    if (filterLane !== "ALL" && g.lane !== filterLane) return false;
    if (filterStatus !== "ALL" && g.status !== filterStatus) return false;
    return true;
  });

  return (
    <section className="workspace-section prediction-workspace" id="gigs" aria-labelledby="gig-title">
      <div className="workspace-heading">
        <div>
          <SectionLabel code="EXC / 001" tone="amber">Gig Exchange</SectionLabel>
          <h2 id="gig-title">Anonymous work market.</h2>
          <p>Browse live gigs, submit without exposing your counterparty, and track the moment escrow routes to the worker.</p>
        </div>
        <div className="market-balance-card">
          <span className="metric-label">CREATE NEW</span>
          <strong className="mono">ESCROW CONTRACT</strong>
          <button 
            type="button" 
            onClick={() => connected ? setIsPostModalOpen(true) : setIsModalOpen(true)}
          >
            {connected ? "POST GIG" : "CONNECT WALLET"} <Plus size={13} />
          </button>
        </div>
      </div>

      <div className="prediction-layout">
        <div className="market-book">
          <div className="panel-title-row">
            <span className="metric-label">
              LIVE GIGS {loadingOnChain && <Loader2 size={11} className="animate-spin inline ml-1 text-amber-500" />}
            </span>
            <span className="mono">BUDGET / STATUS</span>
          </div>

          {loadingOnChain ? (
            <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "rgba(255,255,255,0.5)" }} className="mono">
              <Loader2 size={24} className="animate-spin inline mr-2 text-amber-500" />
              <span>Scanning Solana Devnet for active GigEscrows...</span>
            </div>
          ) : filteredGigs.length === 0 ? (
            <div
              style={{
                padding: "3.5rem 2rem",
                textAlign: "center",
                border: "1px dashed rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                margin: "1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <FileCode size={36} color="rgba(255, 255, 255, 0.2)" />
              <div style={{ maxWidth: "420px" }}>
                <h4 style={{ color: "#fff", fontSize: "1.05rem", margin: "0 0 6px" }}>0 On-Chain Escrows Found</h4>
                <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.82rem", lineHeight: "1.5", margin: 0 }}>
                  No active gig escrows match the current filters on Solana Devnet. Deploy the first escrow contract to initialize an anonymous deliverable market.
                </p>
              </div>
              <button
                type="button"
                className="amber-button mono"
                style={{ fontSize: "0.78rem", padding: "7px 14px", marginTop: "4px" }}
                onClick={() => (connected ? setIsPostModalOpen(true) : setIsModalOpen(true))}
              >
                {connected ? "POST GIG TO ESCROW" : "CONNECT WALLET"} <Plus size={13} />
              </button>
            </div>
          ) : (
            filteredGigs.map((gig: any) => {
              const isReviewing = gig.status === "Reviewing";

              return (
                <article className="market-book-row" key={gig.id}>
                  <div className="market-book-main">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="mono market-book-id">
                        {gig.id} {gig.pda && <span style={{ color: "#10b981", fontSize: "0.65rem" }}>● ON-CHAIN</span>}
                      </span>
                      {gig.category && (
                        <span className="mono" style={{ fontSize: "0.62rem", padding: "1px 6px", borderRadius: "4px", background: "rgba(255, 107, 0, 0.12)", color: "#FF6B00", border: "1px solid rgba(255, 107, 0, 0.25)" }}>
                          {gig.category}
                        </span>
                      )}
                    </div>
                    <Link href={`/gig/${gig.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <h3 style={{ cursor: "pointer", transition: "color 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#FF6B00")} onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}>
                        {gig.title}
                      </h3>
                    </Link>
                    <span className="mono market-book-meta">
                      {gig.lane} · {gig.verification} · CLOSES {gig.deadline}
                    </span>
                  </div>
                  <div className="market-book-prob">
                    <span className="metric-label">BUDGET</span>
                    <strong className="mono">{gig.budget}</strong>
                    <span className="market-trend">{gig.submissions} SUBMISSIONS</span>
                  </div>
                  <div className="market-book-actions">
                    {gig.status === "Accepting" && (
                      <button className="amber-button" onClick={() => handleInteract("submit", gig)}>
                        SUBMIT WORK
                      </button>
                    )}
                    {isReviewing && (
                      <button
                        className="emerald-button mono"
                        style={{ background: "#FF6B00", color: "#000", fontWeight: 700, padding: "6px 12px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" }}
                        onClick={() => setSelectedGigForReview(gig)}
                      >
                        INSPECT DELIVERABLE
                      </button>
                    )}
                    {gig.status === "Funded" && (
                      <button className="outline-button" onClick={() => handleInteract("view_escrow", gig)}>
                        VIEW SETTLED <ExternalLink size={12} />
                      </button>
                    )}
                    {gig.status === "Disputed" && (
                      <button
                        className="mono"
                        style={{
                          background: "rgba(239, 68, 68, 0.15)",
                          color: "#ef4444",
                          border: "1px solid rgba(239, 68, 68, 0.35)",
                          fontWeight: 700,
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                        onClick={() => setSelectedGigForReview(gig)}
                      >
                        INSPECT DISPUTE
                      </button>
                    )}
                    <Link
                      href={`/gig/${gig.id}`}
                      className="mono"
                      style={{
                        padding: "6px 10px",
                        borderRadius: "4px",
                        background: "rgba(255, 107, 0, 0.12)",
                        border: "1px solid rgba(255, 107, 0, 0.3)",
                        color: "#FF6B00",
                        textDecoration: "none",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      UNDERWRITE RISK <ArrowUpRight size={11} />
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <aside className="positions-panel">
          <div className="panel-title-row">
            <span className="metric-label">FILTER GIGS</span>
            <Filter size={15} />
          </div>
          <div className="balance-ledger">
            <div style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
              <span style={{ color: '#e5e5e5' }}>Labor Domain</span>
              <select 
                className="mono" 
                value={filterDomain}
                onChange={(e) => setFilterDomain(e.target.value)}
                style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '4px 6px', width: '100%', marginTop: '4px', borderRadius: '4px', colorScheme: 'dark' }}
              >
                <option value="ALL">ALL DISCIPLINES</option>
                <option value="ENGINEERING">💻 ENGINEERING</option>
                <option value="DESIGN">🎨 DESIGN & CREATIVE</option>
                <option value="RESEARCH">🔬 RESEARCH & STRATEGY</option>
                <option value="AI & DATA">🤖 AI & DATA EVALS</option>
                <option value="OPERATIONS">⚡ OPERATIONS & OPS</option>
                <option value="GROWTH & SOCIAL">📢 GROWTH & SOCIAL</option>
                <option value="CONTENT & WRITING">✍️ CONTENT & WRITING</option>
                <option value="SECURITY & AUDIT">🛡️ SECURITY & AUDIT</option>
                <option value="GENERAL">🌐 GENERAL</option>
              </select>
            </div>
            <div style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
              <span style={{ color: '#e5e5e5' }}>Settlement Model</span>
              <select 
                className="mono" 
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '4px 6px', width: '100%', marginTop: '4px', borderRadius: '4px', colorScheme: 'dark' }}
              >
                <option value="ALL">ALL MODELS</option>
                <option value="BOUNTY">BOUNTY (First Valid)</option>
                <option value="CONTEST">CONTEST (Best Wins)</option>
              </select>
            </div>
            <div style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
              <span style={{ color: '#e5e5e5' }}>Lane</span>
              <select 
                className="mono" 
                value={filterLane}
                onChange={(e) => setFilterLane(e.target.value)}
                style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '4px 6px', width: '100%', marginTop: '4px', borderRadius: '4px', colorScheme: 'dark' }}
              >
                <option value="ALL">ALL LANES</option>
                <option value="Human → Agent">Human → Agent</option>
                <option value="Agent → Agent">Agent → Agent</option>
                <option value="Human → Human">Human → Human</option>
              </select>
            </div>
            <div style={{ paddingBottom: '12px' }}>
              <span style={{ color: '#e5e5e5' }}>Status</span>
              <select 
                className="mono" 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '4px 6px', width: '100%', marginTop: '4px', borderRadius: '4px', colorScheme: 'dark' }}
              >
                <option value="ALL">ALL STATUS</option>
                <option value="Accepting">Accepting</option>
                <option value="Reviewing">Reviewing</option>
                <option value="Funded">Settled</option>
              </select>
            </div>
          </div>
        </aside>
      </div>

      <PostGigModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        onSuccess={handleGigCreated} 
      />

      <SubmitWorkModal
        isOpen={Boolean(selectedGigForSubmission)}
        gig={selectedGigForSubmission}
        onClose={() => setSelectedGigForSubmission(null)}
        onSuccess={handleWorkSubmitted}
      />

      <DeliverableReviewModal
        isOpen={Boolean(selectedGigForReview)}
        gig={selectedGigForReview}
        onClose={() => setSelectedGigForReview(null)}
        onSettled={handleSettled}
        onDisputed={handleDisputed}
      />
    </section>
  );
}
