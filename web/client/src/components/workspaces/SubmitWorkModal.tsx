import React, { useState } from "react";
import { X, Send, ShieldCheck, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { PublicKey, Connection, Transaction, TransactionInstruction } from "@solana/web3.js";
import { useFlintWallet } from "@/contexts/WalletContext";
import { DEVNET_RPC, ESCROW_PROGRAM_ID } from "@/lib/flint-escrow-client";

interface SubmitWorkModalProps {
  isOpen: boolean;
  gig: any;
  onClose: () => void;
  onSuccess: (gigId: string, deliverableUrl: string) => void;
}

const SUBMIT_WORK_DISCRIMINATOR = new Uint8Array([
  0x6c, 0xa1, 0x1d, 0x5b, 0x93, 0x02, 0xe4, 0x77, // precomputed sha256("global:submit_work")[:8]
]);

export const SubmitWorkModal: React.FC<SubmitWorkModalProps> = ({ isOpen, gig, onClose, onSuccess }) => {
  const { walletAddress, connected, setIsModalOpen } = useFlintWallet();
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  if (!isOpen || !gig) return null;

  const handleSubmit = async () => {
    if (!connected || !walletAddress) {
      setIsModalOpen(true);
      return;
    }

    if (!deliverableUrl.trim()) {
      setErrorText("Please provide a pull request link or deliverable URL.");
      return;
    }

    setErrorText(null);
    setLoading(true);
    setStatusText("Generating deliverable commitment hash...");

    try {
      const win = window as any;
      const provider = win.phantom?.solana || win.solflare || win.solana;
      if (!provider) throw new Error("No Solana browser wallet detected.");

      // Compute 32-byte sha256 hash of deliverable URL + notes
      const encoder = new TextEncoder();
      const rawPayload = encoder.encode(`${deliverableUrl}::${notes}::${walletAddress}`);
      const hashBuffer = await crypto.subtle.digest("SHA-256", rawPayload);
      const hashBytes = new Uint8Array(hashBuffer);

      setStatusText("Awaiting wallet signature...");

      // Build submit_work instruction data: [discriminator (8B), deliverable_hash (32B)]
      const data = new Uint8Array(8 + 32);
      data.set(SUBMIT_WORK_DISCRIMINATOR, 0);
      data.set(hashBytes, 8);

      const gigEscrowPda = gig.pda ? new PublicKey(gig.pda) : null;

      if (gigEscrowPda) {
        const connection = new Connection(DEVNET_RPC, "confirmed");
        const instruction = new TransactionInstruction({
          programId: ESCROW_PROGRAM_ID,
          data: Buffer.from(data),
          keys: [
            { pubkey: gigEscrowPda, isSigner: false, isWritable: true },
            { pubkey: new PublicKey(walletAddress), isSigner: true, isWritable: true },
          ],
        });

        const transaction = new Transaction().add(instruction);
        const { blockhash } = await connection.getLatestBlockhash("confirmed");
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new PublicKey(walletAddress);

        let sig = "";
        if (provider.signAndSendTransaction) {
          const res = await provider.signAndSendTransaction(transaction);
          sig = res.signature || res.toString();
        } else if (provider.sendTransaction) {
          sig = await provider.sendTransaction(transaction, connection);
        }
        await connection.confirmTransaction(sig, "confirmed");
        setTxSignature(sig);
      }

      onSuccess(gig.id, deliverableUrl);
    } catch (err: any) {
      console.error("Submission failed:", err);
      // If the on-chain account doesn't match the caller or is a mock gig, fallback gracefully:
      setErrorText(err?.message || "Transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTxSignature(null);
    setErrorText(null);
    setDeliverableUrl("");
    setNotes("");
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
      onClick={handleClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
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
            <Send size={22} color="#FF6B00" />
            <div>
              <span className="mono" style={{ fontSize: "0.68rem", color: "#FF6B00", letterSpacing: "0.08em", fontWeight: 700 }}>
                SUBMIT DELIVERABLE
              </span>
              <h3 style={{ margin: "2px 0 0", fontSize: "1.05rem", fontWeight: 600, color: "#fff" }}>
                {gig.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
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

        <div style={{ padding: "1.5rem" }}>
          {txSignature ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981" }}>
                <CheckCircle2 size={20} />
                <strong style={{ fontSize: "0.95rem" }}>Submission Recorded On-Chain!</strong>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
                Your cryptographic proof has been locked into the escrow state. The gig status is now <strong>Reviewing</strong>.
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
                  background: "#FF6B00",
                  color: "#000",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}
                className="mono"
              >
                VIEW COMMITMENT ON EXPLORER <ExternalLink size={14} />
              </a>
              <button
                type="button"
                onClick={handleClose}
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
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }} className="mono">
                  Pull Request / Deliverable URL
                </label>
                <input
                  type="url"
                  disabled={loading}
                  placeholder="https://github.com/org/repo/pull/42"
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
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
                  Execution Proof / Notes
                </label>
                <textarea
                  rows={3}
                  disabled={loading}
                  placeholder="Summary of benchmark results, test coverage, and deployment verification."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    padding: "0.6rem",
                    borderRadius: "6px",
                    outline: "none",
                    resize: "none",
                  }}
                />
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
                onClick={handleSubmit}
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
                }}
                className="mono"
              >
                {loading ? "SUBMITTING ON-CHAIN..." : "LOCK PROOF & SUBMIT DELIVERABLE"}
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
            <ShieldCheck size={14} color="#10b981" />
            <span>Cryptographically sealed commitment hash</span>
          </div>
          <span className="mono" style={{ color: "#FF6B00" }}>BOUNTY SETTLEMENT</span>
        </div>
      </div>
    </div>
  );
};
