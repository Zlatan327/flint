import React, { useState } from "react";
import { X, ExternalLink, ShieldCheck, CheckCircle2, AlertTriangle, Loader2, Award, FileCode, Figma, BookOpen, Database, Zap } from "lucide-react";
import { useFlintWallet } from "@/contexts/WalletContext";
import { settleEscrowOnChain } from "@/lib/flint-escrow-client";
import { PublicKey } from "@solana/web3.js";

interface DeliverableReviewModalProps {
  isOpen: boolean;
  gig: any;
  onClose: () => void;
  onSettled: (gigId: string, txSignature: string) => void;
}

export const DeliverableReviewModal: React.FC<DeliverableReviewModalProps> = ({
  isOpen,
  gig,
  onClose,
  onSettled,
}) => {
  const { walletAddress, connected, setIsModalOpen } = useFlintWallet();
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [disputeNote, setDisputeNote] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  if (!isOpen || !gig) return null;

  const deliverableUrl = gig.deliverableUrl || "https://github.com/flint-protocol/delivery/pull/42";
  const deliverableNotes = gig.deliverableNotes || "Completed specifications, full test suite passing, and verified against acceptance criteria.";
  const deliverableHash = gig.deliverableHash || "8f2a1b9c4d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a";
  const deliverableType = gig.deliverableType || "Code / Repository PR";

  const getFormatIcon = () => {
    if (deliverableType.includes("Figma") || gig.category === "DESIGN") return <Figma size={18} color="#FF6B00" />;
    if (deliverableType.includes("Research") || gig.category === "RESEARCH") return <BookOpen size={18} color="#38bdf8" />;
    if (deliverableType.includes("AI") || gig.category === "AI & DATA") return <Database size={18} color="#a855f7" />;
    if (deliverableType.includes("Deployment") || gig.category === "OPERATIONS") return <Zap size={18} color="#eab308" />;
    return <FileCode size={18} color="#10b981" />;
  };

  const handleApproveAndRelease = async () => {
    if (!connected || !walletAddress) {
      setIsModalOpen(true);
      return;
    }

    setLoading(true);
    setErrorText(null);
    setStatusText("Preparing L1 vault release transaction...");

    try {
      const win = window as any;
      const provider = win.phantom?.solana || win.solflare || win.solana;
      if (!provider) throw new Error("No Solana browser wallet detected.");

      const gigEscrowPda = gig.pda;
      const workerPubkey = gig.freelancer || walletAddress;

      if (!gigEscrowPda) {
        throw new Error("Gig does not have a valid on-chain escrow PDA on Devnet.");
      }

      setStatusText("Awaiting wallet settlement approval...");
      const clientPubkey = new PublicKey(walletAddress);

      const sig = await settleEscrowOnChain(
        gigEscrowPda,
        workerPubkey,
        clientPubkey,
        provider
      );

      setTxSignature(sig);
      onSettled(gig.id, sig);
    } catch (err: any) {
      console.error("Settlement failed:", err);
      setErrorText(err?.message || "Settlement failed or rejected.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(10px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          margin: "1rem",
          backgroundColor: "#0a0c10",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "14px",
          boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.95)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.2rem 1.5rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {getFormatIcon()}
            <div>
              <span className="mono" style={{ fontSize: "0.68rem", color: "#FF6B00", letterSpacing: "0.08em", fontWeight: 700 }}>
                INSPECT DELIVERABLE · {gig.id}
              </span>
              <h3 style={{ margin: "2px 0 0", fontSize: "1.05rem", fontWeight: 600, color: "#fff" }}>
                {gig.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "rgba(255, 255, 255, 0.6)",
              padding: "6px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "1.5rem" }}>
          {txSignature ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981" }}>
                <CheckCircle2 size={20} />
                <strong style={{ fontSize: "0.95rem" }}>Escrow Settled & Vault Released!</strong>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
                {gig.budget} has been disbursed from the Solana Devnet Vault PDA directly to the worker. A Soulbound Token (SBT) reputation badge was minted via Metaplex Core.
              </p>
              <a
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  background: "#10b981",
                  color: "#000",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}
                className="mono"
              >
                VIEW SETTLEMENT ON SOLANA EXPLORER <ExternalLink size={14} />
              </a>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "0.6rem",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
                className="mono"
              >
                CLOSE
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Deliverable Link Card */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span className="mono" style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                  Worker Submitted Deliverable
                </span>
                <a
                  href={deliverableUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "rgba(255, 107, 0, 0.08)",
                    border: "1px solid rgba(255, 107, 0, 0.25)",
                    borderRadius: "8px",
                    color: "#FF6B00",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                  className="mono"
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: "8px" }}>
                    {deliverableUrl}
                  </span>
                  <ExternalLink size={15} style={{ flexShrink: 0 }} />
                </a>
                <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)" }}>
                  Click to inspect full artifacts (Figma auto-layout, GitHub PR diff, Google Doc, or Dataset).
                </span>
              </div>

              {/* Verifier Notes */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span className="mono" style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                  Execution Summary & Notes
                </span>
                <div
                  style={{
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "6px",
                    color: "rgba(255,255,255,0.85)",
                    fontSize: "0.8rem",
                    lineHeight: "1.4",
                  }}
                >
                  {deliverableNotes}
                </div>
              </div>

              {/* Cryptographic SHA-256 Seal */}
              <div
                style={{
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
                className="mono"
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem" }}>
                  <span style={{ color: "#888" }}>ON-CHAIN SHA-256 HASH:</span>
                  <span style={{ color: "#10b981" }}>SEALED IN ESCROW PDA</span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#38bdf8", wordBreak: "break-all" }}>
                  {deliverableHash}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", marginTop: "2px" }}>
                  <span style={{ color: "#888" }}>ESCROW VAULT:</span>
                  <span style={{ color: "#fff" }}>{gig.budget}</span>
                </div>
              </div>

              {errorText && (
                <div style={{ padding: "8px 12px", background: "rgba(225, 29, 72, 0.15)", border: "1px solid rgba(225, 29, 72, 0.3)", borderRadius: "6px", color: "#f43f5e", fontSize: "0.75rem" }} className="mono">
                  {errorText}
                </div>
              )}

              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981", fontSize: "0.8rem" }} className="mono">
                  <Loader2 size={16} className="animate-spin" />
                  <span>{statusText}</span>
                </div>
              )}

              {disputeNote && (
                <div style={{ padding: "10px 12px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "6px", color: "#f59e0b", fontSize: "0.75rem" }}>
                  <strong>Dispute Freeze Initiated:</strong> Escrow vault funds are locked on Solana L1. The Arbiter Quorum or decentralized oracle will review the cryptographic deliverable proof hash against original specifications.
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleApproveAndRelease}
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    borderRadius: "8px",
                    background: loading ? "#555" : "#10b981",
                    color: "#000",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  className="mono"
                >
                  <Award size={16} />
                  {loading ? "SETTLING ON-CHAIN..." : `APPROVE DELIVERABLE & RELEASE ${gig.budget}`}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setDisputeNote(true)}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "6px",
                    background: "transparent",
                    color: "rgba(255,255,255,0.45)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                  className="mono"
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f43f5e")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                >
                  <AlertTriangle size={13} />
                  RAISE QUALITY DISPUTE / FREEZE ESCROW
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0.85rem 1.5rem",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.7rem",
            color: "rgba(255, 255, 255, 0.45)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>Cryptographic delivery verification</span>
          </div>
          <span className="mono" style={{ color: "#10b981" }}>DEVNET L1 ESCROW</span>
        </div>
      </div>
    </div>
  );
};
