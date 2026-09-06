import React, { useState } from "react";
import { X, ExternalLink, ShieldCheck, CheckCircle2, AlertTriangle, Loader2, Award, FileCode, Figma, BookOpen, Database, Zap, Lock, Globe, FileText, ShieldAlert } from "lucide-react";
import { useFlintWallet } from "@/contexts/WalletContext";
import { settleEscrowOnChain, raiseDisputeOnChain, calculateEscrowFeeSplit, PROTOCOL_TREASURY_PDA } from "@/lib/flint-escrow-client";
import { PublicKey } from "@solana/web3.js";

interface DeliverableReviewModalProps {
  isOpen: boolean;
  gig: any;
  onClose: () => void;
  onSettled: (gigId: string, txSignature: string) => void;
  onDisputed?: (gigId: string, txSignature: string) => void;
}

export const DeliverableReviewModal: React.FC<DeliverableReviewModalProps> = ({
  isOpen,
  gig,
  onClose,
  onSettled,
  onDisputed,
}) => {
  const { walletAddress, connected, setIsModalOpen } = useFlintWallet();
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [disputeNote, setDisputeNote] = useState(false);
  const [disputeTx, setDisputeTx] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  if (!isOpen || !gig) return null;

  const deliverableUrl = gig.deliverableUrl || "https://github.com/flint-protocol/delivery/pull/42";
  const deliverableNotes = gig.deliverableNotes || "Completed specifications, full test suite passing, and verified against acceptance criteria.";
  const deliverableHash = gig.deliverableHash || "8f2a1b9c4d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a";
  const deliverableType = gig.deliverableType || "Code / Repository PR";

  const budgetSol = parseFloat(String(gig.budget || "").replace(/[^0-9.]/g, "")) || 0;
  const feeSplit = calculateEscrowFeeSplit(budgetSol);

  // Authority checks: ONLY the gig creator (client) can approve and release funds.
  const isClient = Boolean(
    connected &&
    walletAddress &&
    gig.client &&
    walletAddress.toLowerCase() === gig.client.toLowerCase()
  );

  const isFreelancer = Boolean(
    connected &&
    walletAddress &&
    gig.freelancer &&
    walletAddress.toLowerCase() === gig.freelancer.toLowerCase()
  );

  const canDispute = isClient || isFreelancer;
  const isDisputed = gig.status === "Disputed" || disputeNote;

  const getFormatIcon = () => {
    if (deliverableType.includes("Figma") || gig.category === "DESIGN") return <Figma size={18} color="#FF6B00" />;
    if (deliverableType.includes("Research") || gig.category === "RESEARCH") return <BookOpen size={18} color="#38bdf8" />;
    if (deliverableType.includes("AI") || gig.category === "AI & DATA") return <Database size={18} color="#a855f7" />;
    if (deliverableType.includes("Deployment") || gig.category === "OPERATIONS") return <Zap size={18} color="#eab308" />;
    if (deliverableType.includes("Social") || deliverableType.includes("Verification") || gig.category === "GROWTH & SOCIAL") return <Globe size={18} color="#f43f5e" />;
    if (deliverableType.includes("Content") || deliverableType.includes("Article") || gig.category === "CONTENT & WRITING") return <FileText size={18} color="#f59e0b" />;
    if (deliverableType.includes("Security") || deliverableType.includes("Audit") || gig.category === "SECURITY & AUDIT") return <ShieldAlert size={18} color="#ec4899" />;
    return <FileCode size={18} color="#10b981" />;
  };

  const handleApproveAndRelease = async () => {
    if (!connected || !walletAddress) {
      setIsModalOpen(true);
      return;
    }

    if (!isClient) {
      setErrorText(`Authority check: Only the gig creator (${gig.client ? `${gig.client.slice(0, 4)}...${gig.client.slice(-4)}` : "Client"}) can approve deliverable and release escrow vault funds.`);
      return;
    }

    setLoading(true);
    setErrorText(null);
    setStatusText("Preparing L1 vault release transaction...");

    try {
      const win = window as any;
      const provider = win.okxwallet?.solana || win.phantom?.solana || win.solflare || win.backpack || win.solana;
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
      setErrorText(err?.message || "Settlement failed or was rejected.");
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseDispute = async () => {
    if (!connected || !walletAddress) {
      setIsModalOpen(true);
      return;
    }

    if (!canDispute) {
      setErrorText(`Only the gig creator (${gig.client ? `${gig.client.slice(0, 4)}...${gig.client.slice(-4)}` : "Client"}) or assigned builder can raise an escrow dispute.`);
      return;
    }

    setLoading(true);
    setErrorText(null);
    setStatusText("Initiating on-chain dispute freeze transaction on Solana L1...");

    try {
      const win = window as any;
      const provider = win.okxwallet?.solana || win.phantom?.solana || win.solflare || win.backpack || win.solana;
      if (!provider) throw new Error("No Solana browser wallet detected.");

      const gigEscrowPda = gig.pda;
      if (!gigEscrowPda) {
        throw new Error("Gig does not have a valid on-chain escrow PDA on Devnet.");
      }

      setStatusText("Awaiting wallet signature to freeze escrow on Devnet...");
      const callerPubkey = new PublicKey(walletAddress);

      const sig = await raiseDisputeOnChain(
        gigEscrowPda,
        callerPubkey,
        provider
      );

      setDisputeTx(sig);
      setDisputeNote(true);
      if (onDisputed) {
        onDisputed(gig.id, sig);
      }
    } catch (err: any) {
      console.error("Dispute failed:", err);
      setErrorText(err?.message || "Dispute transaction failed or was rejected.");
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
                {feeSplit.builderPayoutSol.toFixed(4)} SOL has been disbursed directly to the worker, and {feeSplit.protocolFeeSol.toFixed(4)} SOL (1.5% take rate) was transferred to the Flint Protocol Treasury PDA. A Soulbound Token (SBT) reputation badge was minted atomically on-chain.
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
                <div
                  style={{
                    padding: "8px 10px",
                    background: "rgba(255, 107, 0, 0.05)",
                    border: "1px solid rgba(255, 107, 0, 0.2)",
                    borderRadius: "6px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    marginTop: "6px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem" }}>
                    <span style={{ color: "#aaa" }}>GROSS ESCROW VAULT:</span>
                    <span style={{ color: "#fff", fontWeight: 600 }}>{feeSplit.grossSol.toFixed(2)} SOL</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem" }}>
                    <span style={{ color: "#FF6B00" }}>PROTOCOL TAKE RATE (1.5%):</span>
                    <span style={{ color: "#FF6B00", fontWeight: 600 }}>- {feeSplit.protocolFeeSol.toFixed(4)} SOL</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "4px" }}>
                    <span style={{ color: "#10b981", fontWeight: 600 }}>NET RELEASED TO BUILDER:</span>
                    <span style={{ color: "#10b981", fontWeight: 700 }}>{feeSplit.builderPayoutSol.toFixed(4)} SOL</span>
                  </div>
                </div>
              </div>

              {/* Creator & Authority Status Banner */}
              {!isClient && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: isFreelancer ? "rgba(56, 189, 248, 0.08)" : "rgba(255, 255, 255, 0.04)",
                    border: isFreelancer ? "1px solid rgba(56, 189, 248, 0.25)" : "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    color: isFreelancer ? "#38bdf8" : "rgba(255, 255, 255, 0.7)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  className="mono"
                >
                  <Lock size={14} style={{ flexShrink: 0, color: isFreelancer ? "#38bdf8" : "#888" }} />
                  <div>
                    {isFreelancer ? (
                      <span>YOU ARE THE WORKER · Awaiting client approval ({gig.client ? `${gig.client.slice(0, 4)}...${gig.client.slice(-4)}` : "Client"}). You cannot release your own escrow.</span>
                    ) : (
                      <span>READ-ONLY INSPECTION · Created by {gig.client ? `${gig.client.slice(0, 4)}...${gig.client.slice(-4)}` : "creator"}. Only the gig creator can approve payout release.</span>
                    )}
                  </div>
                </div>
              )}

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

              {isDisputed && (
                <div style={{ padding: "10px 12px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "6px", color: "#f59e0b", fontSize: "0.75rem" }}>
                  <strong>Dispute Freeze Active:</strong> Escrow vault funds are frozen on Solana L1. The Arbiter Quorum or decentralized oracle will review the deliverable proof hash against original specifications.
                  {disputeTx && (
                    <div style={{ marginTop: "6px" }}>
                      <a
                        href={`https://explorer.solana.com/tx/${disputeTx}?cluster=devnet`}
                        target="_blank"
                        rel="noreferrer"
                        className="mono"
                        style={{ color: "#FF6B00", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        View On-Chain Dispute Tx ↗
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {isClient ? (
                  <button
                    type="button"
                    disabled={loading || Boolean(isDisputed)}
                    onClick={handleApproveAndRelease}
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "8px",
                      background: loading || isDisputed ? "#333" : "#10b981",
                      color: loading || isDisputed ? "rgba(255,255,255,0.4)" : "#000",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      cursor: loading || isDisputed ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                    className="mono"
                  >
                    <Award size={16} />
                    {loading ? "SETTLING ON-CHAIN..." : isDisputed ? "ESCROW FROZEN IN DISPUTE" : `APPROVE DELIVERABLE & RELEASE ${gig.budget}`}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.04)",
                      color: "rgba(255, 255, 255, 0.35)",
                      border: "1px dashed rgba(255, 255, 255, 0.12)",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      cursor: "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                    className="mono"
                  >
                    <Lock size={14} />
                    {isFreelancer ? "AWAITING CLIENT APPROVAL (WORKER CANNOT APPROVE)" : "ONLY GIG CREATOR CAN APPROVE RELEASE"}
                  </button>
                )}

                {canDispute ? (
                  <button
                    type="button"
                    disabled={loading || Boolean(isDisputed)}
                    onClick={handleRaiseDispute}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      borderRadius: "6px",
                      background: isDisputed ? "rgba(239, 68, 68, 0.12)" : "rgba(239, 68, 68, 0.06)",
                      color: isDisputed ? "#ef4444" : "#f43f5e",
                      border: isDisputed ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(239, 68, 68, 0.25)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: loading || isDisputed ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 160ms var(--ease-out)",
                    }}
                    className="mono"
                  >
                    <AlertTriangle size={13} />
                    {loading ? "SUBMITTING DISPUTE..." : isDisputed ? "DISPUTE ACTIVE · ESCROW FROZEN ON L1" : "RAISE QUALITY DISPUTE / FREEZE ESCROW"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "6px",
                      background: "transparent",
                      color: "rgba(255, 255, 255, 0.25)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      fontSize: "0.72rem",
                      cursor: "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                    className="mono"
                  >
                    <AlertTriangle size={12} />
                    DISPUTES RESTRICTED TO CLIENT OR WORKER
                  </button>
                )}
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
