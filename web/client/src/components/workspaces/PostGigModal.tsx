import React, { useState } from "react";
import { X, Plus, ShieldCheck, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { useFlintWallet } from "@/contexts/WalletContext";
import { initializeAndDepositEscrow, EscrowTxResult } from "@/lib/flint-escrow-client";
import { GigCategory } from "@/lib/flint-data";

interface PostGigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: EscrowTxResult, gigData: { title: string; budget: string; lane: string; model: string; category: GigCategory; description?: string }) => void;
}

export const PostGigModal: React.FC<PostGigModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { walletAddress, connected, setIsModalOpen } = useFlintWallet();
  const [model, setModel] = useState<"BOUNTY (First Valid)" | "CONTEST (Best Wins)">("BOUNTY (First Valid)");
  const [category, setCategory] = useState<GigCategory>("ENGINEERING");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("0.05");
  const [lane, setLane] = useState("Human → Agent");

  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<EscrowTxResult | null>(null);

  if (!isOpen) return null;

  const handleInitializeEscrow = async () => {
    if (!connected || !walletAddress) {
      setIsModalOpen(true);
      return;
    }

    if (!title.trim()) {
      setErrorText("Please enter a gig title.");
      return;
    }

    setErrorText(null);
    setLoading(true);
    setStatusText("Preparing Solana Devnet transaction...");

    try {
      // Find wallet provider (Phantom, Solflare, etc.)
      const win = window as any;
      const provider = win.phantom?.solana || win.solflare || win.backpack || win.solana;

      if (!provider) {
        throw new Error("No Solana browser wallet detected (e.g. Phantom). Please install or unlock your wallet.");
      }

      setStatusText("Awaiting wallet approval & signature...");

      const isBounty = model.startsWith("BOUNTY");
      const result = await initializeAndDepositEscrow(
        {
          title: title.trim(),
          budgetSol: parseFloat(budget) || 0.01,
          lane,
          model: isBounty ? "BOUNTY" : "CONTEST",
          clientPubkey: new PublicKey(walletAddress),
        },
        provider
      );

      setStatusText("Transaction confirmed on Devnet!");
      setTxResult(result);
      onSuccess(result, {
        title: title.trim(),
        budget: `${budget} SOL`,
        lane,
        model: isBounty ? "Bounty" : "Contest",
        category,
        description: description.trim(),
      });
    } catch (err: any) {
      console.error("Escrow deployment error:", err);
      setErrorText(err?.message || "Transaction failed or rejected by wallet.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setTxResult(null);
    setErrorText(null);
    setStatusText("");
    onClose();
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
      onClick={handleResetAndClose}
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
            <Plus size={28} color="#FF6B00" />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="mono" style={{ fontSize: "0.68rem", color: "#FF6B00", letterSpacing: "0.08em", fontWeight: 700 }}>
                  LIVE SOLANA ESCROW
                </span>
                <span className="mono" style={{ fontSize: "0.6rem", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "1px 5px", borderRadius: "3px" }}>
                  DEVNET
                </span>
              </div>
              <h3 style={{ margin: "2px 0 0", fontSize: "1.05rem", fontWeight: 600, color: "#fff" }}>
                Post Gig to Escrow
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "rgba(255, 255, 255, 0.6)",
              padding: "6px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {txResult ? (
            /* Success State */
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981" }}>
                <CheckCircle2 size={20} />
                <strong style={{ fontSize: "0.95rem" }}>Gig Escrow Live on Solana!</strong>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
                Your gig #{txResult.gigId} has been created and escrow funds are locked in the Vault PDA on Devnet.
              </p>
              
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }} className="mono">
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
                  <span style={{ color: "#888" }}>GIG ID:</span>
                  <span style={{ color: "#fff" }}>#{txResult.gigId}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
                  <span style={{ color: "#888" }}>ESCROW PDA:</span>
                  <span style={{ color: "#FF6B00" }}>{txResult.gigEscrowPda.slice(0, 8)}...{txResult.gigEscrowPda.slice(-6)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
                  <span style={{ color: "#888" }}>VAULT PDA:</span>
                  <span style={{ color: "#10b981" }}>{txResult.vaultPda.slice(0, 8)}...{txResult.vaultPda.slice(-6)}</span>
                </div>
              </div>

              <a
                href={txResult.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  background: "#FF6B00",
                  color: "#000",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}
                className="mono"
              >
                VIEW ON SOLANA EXPLORER <ExternalLink size={14} />
              </a>

              <button
                type="button"
                onClick={handleResetAndClose}
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
            /* Form State */
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }} className="mono">
                  Settlement Model
                </label>
                <select
                  value={model}
                  disabled={loading}
                  onChange={(e) => setModel(e.target.value as any)}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    padding: "0.6rem",
                    borderRadius: "6px",
                    outline: "none",
                  }}
                  className="mono"
                >
                  <option value="BOUNTY (First Valid)">BOUNTY (First Valid Submission Wins)</option>
                  <option value="CONTEST (Best Wins)">CONTEST (Requester Picks Best Submission)</option>
                </select>
                <span style={{ fontSize: "0.7rem", color: "#FF6B00", marginTop: "2px" }}>
                  {model.startsWith("BOUNTY")
                    ? "Commit-reveal enabled. Freelancer claims dynamically upon valid submission."
                    : "Upfront escrow locked. You assign the winning freelancer via on-chain instruction."}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }} className="mono">
                    Labor Domain
                  </label>
                  <select
                    value={category}
                    disabled={loading}
                    onChange={(e) => setCategory(e.target.value as any)}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      padding: "0.6rem",
                      borderRadius: "6px",
                      outline: "none",
                    }}
                    className="mono"
                  >
                    <option value="ENGINEERING">💻 ENGINEERING</option>
                    <option value="DESIGN">🎨 DESIGN & CREATIVE</option>
                    <option value="RESEARCH">🔬 RESEARCH & STRATEGY</option>
                    <option value="AI & DATA">🤖 AI & DATA EVALS</option>
                    <option value="OPERATIONS">⚡ OPERATIONS & OPS</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }} className="mono">
                    Lane
                  </label>
                  <select
                    value={lane}
                    disabled={loading}
                    onChange={(e) => setLane(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      padding: "0.6rem",
                      borderRadius: "6px",
                      outline: "none",
                    }}
                    className="mono"
                  >
                    <option>Human → Agent</option>
                    <option>Agent → Agent</option>
                    <option>Human → Human</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }} className="mono">
                  Gig Title
                </label>
                <input
                  type="text"
                  disabled={loading}
                  placeholder={
                    category === "DESIGN"
                      ? "e.g. Design system migration / 12 surfaces"
                      : category === "RESEARCH"
                      ? "e.g. Tokenomics simulation & threat model"
                      : category === "AI & DATA"
                      ? "e.g. 1,000 Pairwise RLHF Evaluation Dataset"
                      : category === "OPERATIONS"
                      ? "e.g. Developer Docs Localization & Deployment"
                      : "e.g. Rust async benchmark suite"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    padding: "0.6rem",
                    borderRadius: "6px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }} className="mono">
                  Specifications & Acceptance Criteria
                </label>
                <textarea
                  rows={2}
                  disabled={loading}
                  placeholder="Describe the expected deliverable, quality benchmarks, and verification format (Figma, GitHub, Notion, etc.)."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    padding: "0.6rem",
                    borderRadius: "6px",
                    outline: "none",
                    resize: "none",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }} className="mono">
                    Escrow Budget (SOL)
                  </label>
                  <span className="mono" style={{ fontSize: "0.68rem", color: "#10b981" }}>
                    VAULT PDA LOCKED
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.001"
                  disabled={loading}
                  placeholder="0.05"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    padding: "0.6rem",
                    borderRadius: "6px",
                    outline: "none",
                  }}
                  className="mono"
                />
                <div style={{ padding: "8px 10px", background: "rgba(255, 107, 0, 0.05)", border: "1px solid rgba(255, 107, 0, 0.15)", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem" }} className="mono">
                    <span style={{ color: "#aaa" }}>VAULT DEPOSIT:</span>
                    <span style={{ color: "#fff", fontWeight: 600 }}>{budget ? `${Number(budget).toFixed(2)} SOL` : "0.00 SOL"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem" }} className="mono">
                    <span style={{ color: "#FF6B00" }}>PROTOCOL TAKE RATE:</span>
                    <span style={{ color: "#FF6B00", fontWeight: 600 }}>1.50% (settlement fee)</span>
                  </div>
                  <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>
                    Funds transfer directly into the program vault PDA. Released only upon deliverable approval.
                  </div>
                </div>
              </div>

              {errorText && (
                <div style={{ padding: "8px 12px", background: "rgba(225, 29, 72, 0.15)", border: "1px solid rgba(225, 29, 72, 0.3)", borderRadius: "6px", color: "#f43f5e", fontSize: "0.75rem" }} className="mono">
                  {errorText}
                </div>
              )}

              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#FF6B00", fontSize: "0.8rem" }} className="mono">
                  <Loader2 size={16} className="animate-spin" />
                  <span>{statusText}</span>
                </div>
              )}

              <button
                type="button"
                disabled={loading}
                onClick={handleInitializeEscrow}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  borderRadius: "8px",
                  background: loading ? "#555" : "#FF6B00",
                  color: "#000",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
                className="mono"
              >
                {loading ? "INITIALIZING ESCROW ON-CHAIN..." : "LOCK FUNDS & POST TO DEVNET"}
              </button>
            </div>
          )}
        </div>

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
            <ShieldCheck size={14} color="#FF6B00" />
            <span>Program ID: 2PQbtiG...KQD6h</span>
          </div>
          <span className="mono" style={{ color: "#10b981" }}>SOLANA DEVNET</span>
        </div>
      </div>
    </div>
  );
};
