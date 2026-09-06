import React, { useState } from "react";
import { Buffer } from "buffer";
import { X, Send, ShieldCheck, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { PublicKey, Connection, Transaction, TransactionInstruction } from "@solana/web3.js";
import { useFlintWallet } from "@/contexts/WalletContext";
import { DEVNET_RPC, ESCROW_PROGRAM_ID } from "@/lib/flint-escrow-client";
import { saveGigMetadata } from "@/lib/flint-chain-sync";
import { DeliverableType } from "@/lib/flint-data";

interface SubmitWorkModalProps {
  isOpen: boolean;
  gig: any;
  onClose: () => void;
  onSuccess: (gigId: string, deliverableUrl: string, deliverableType?: DeliverableType, notes?: string, hashHex?: string) => void;
}

const SUBMIT_WORK_DISCRIMINATOR = new Uint8Array([
  0x6c, 0xa1, 0x1d, 0x5b, 0x93, 0x02, 0xe4, 0x77, // precomputed sha256("global:submit_work")[:8]
]);

export const SubmitWorkModal: React.FC<SubmitWorkModalProps> = ({ isOpen, gig, onClose, onSuccess }) => {
  const { walletAddress, connected, setIsModalOpen } = useFlintWallet();
  const [deliverableType, setDeliverableType] = useState<DeliverableType>(
    gig?.deliverableType ||
    (gig?.category === "GROWTH & SOCIAL"
      ? "Social / Verification Proof (X, Telegram, Discord)"
      : gig?.category === "CONTENT & WRITING"
      ? "Content / Article / Video Link"
      : gig?.category === "SECURITY & AUDIT"
      ? "Security Audit / Report"
      : gig?.category === "DESIGN"
      ? "Figma / Design URL"
      : gig?.category === "RESEARCH"
      ? "Research Doc / Whitepaper"
      : gig?.category === "AI & DATA"
      ? "AI Dataset / Weights"
      : gig?.category === "OPERATIONS"
      ? "Deployment Receipt"
      : gig?.category === "GENERAL"
      ? "Custom / Live Web Proof"
      : "Code / Repository PR")
  );
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [generatedHash, setGeneratedHash] = useState<string | null>(null);

  if (!isOpen || !gig) return null;

  const handleSubmit = async () => {
    if (!connected || !walletAddress) {
      setIsModalOpen(true);
      return;
    }

    if (!deliverableUrl.trim()) {
      setErrorText("Please provide a deliverable proof URL or social verification link.");
      return;
    }

    setErrorText(null);
    setLoading(true);
    setStatusText("Generating deliverable commitment hash...");

    try {
      const win = window as any;
      const provider =
        win.okxwallet?.solana ||
        win.phantom?.solana ||
        win.solflare ||
        win.backpack ||
        win.solana;
      if (!provider) throw new Error("No Solana browser wallet detected.");

      // Compute 32-byte sha256 hash of deliverable type + URL + notes + walletAddress
      const encoder = new TextEncoder();
      const rawPayload = encoder.encode(`${deliverableType}::${deliverableUrl}::${notes}::${walletAddress}`);
      const hashBuffer = await crypto.subtle.digest("SHA-256", rawPayload);
      const hashBytes = new Uint8Array(hashBuffer);
      const hashHex = Array.from(hashBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
      setGeneratedHash(hashHex);

      setStatusText("Awaiting wallet signature...");

      // Build submit_work instruction data: [discriminator (8B), deliverable_hash (32B)]
      const data = new Uint8Array(8 + 32);
      data.set(SUBMIT_WORK_DISCRIMINATOR, 0);
      data.set(hashBytes, 8);

      if (!gig?.pda) throw new Error("Gig does not have a valid on-chain escrow PDA on Devnet.");
      const gigEscrowPda = new PublicKey(gig.pda);

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

      saveGigMetadata(gig.id, gig.pda, {
        deliverableType,
        deliverableUrl,
        deliverableNotes: notes,
        deliverableHash: hashHex,
      });

      onSuccess(gig.id, deliverableUrl, deliverableType, notes, hashHex);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorText(err?.message || "Transaction failed or rejected by wallet.");
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
                  Deliverable Format / Discipline
                </label>
                <select
                  value={deliverableType}
                  disabled={loading}
                  onChange={(e) => setDeliverableType(e.target.value as DeliverableType)}
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
                  <option value="Code / Repository PR">💻 Code / Repository Pull Request</option>
                  <option value="Social / Verification Proof (X, Telegram, Discord)">🌐 Social / Verification Proof (X, Telegram, Discord, Profile)</option>
                  <option value="Content / Article / Video Link">✍️ Content / Article / Video Link</option>
                  <option value="Figma / Design URL">🎨 Figma / Design File or Prototype</option>
                  <option value="Research Doc / Whitepaper">🔬 Research Document / Whitepaper (Docs, Notion, PDF)</option>
                  <option value="AI Dataset / Weights">🤖 AI Dataset / Model Weights (Hugging Face, CSV, JSON)</option>
                  <option value="Security Audit / Report">🛡️ Security Audit / Vulnerability Report</option>
                  <option value="Deployment Receipt">⚡ Deployment / Milestone Receipt (Tx Signature, URL)</option>
                  <option value="Custom / Live Web Proof">🔗 Custom / Live Web Proof URL</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }} className="mono">
                    {deliverableType === "Social / Verification Proof (X, Telegram, Discord)"
                      ? "Social Profile / Verification URL"
                      : deliverableType === "Content / Article / Video Link"
                      ? "Article / Media / Publication Link"
                      : deliverableType === "Security Audit / Report"
                      ? "Security Audit / Report Document Link"
                      : deliverableType === "Custom / Live Web Proof"
                      ? "Live Deliverable / Verification URL"
                      : deliverableType === "Figma / Design URL"
                      ? "Figma File / Prototype URL"
                      : deliverableType === "Research Doc / Whitepaper"
                      ? "Document / Whitepaper Link"
                      : deliverableType === "AI Dataset / Weights"
                      ? "Hugging Face / Dataset Link"
                      : deliverableType === "Deployment Receipt"
                      ? "Solana Tx / Deployment URL"
                      : "Pull Request / Repository URL"}
                  </label>
                  <span className="mono" style={{ fontSize: "0.68rem", color: "#FF6B00" }}>
                    SEALED AS SHA-256 PROOF
                  </span>
                </div>
                <input
                  type="url"
                  disabled={loading}
                  placeholder={
                    deliverableType === "Social / Verification Proof (X, Telegram, Discord)"
                      ? "https://x.com/username or tweet URL, Discord message / profile link"
                      : deliverableType === "Content / Article / Video Link"
                      ? "https://mirror.xyz/... or Medium, Substack, YouTube URL"
                      : deliverableType === "Security Audit / Report"
                      ? "https://github.com/.../audit.pdf or report link"
                      : deliverableType === "Custom / Live Web Proof"
                      ? "https://... (live verifiable deliverable URL)"
                      : deliverableType === "Figma / Design URL"
                      ? "https://www.figma.com/file/..."
                      : deliverableType === "Research Doc / Whitepaper"
                      ? "https://docs.google.com/... or Notion, Arweave, PDF"
                      : deliverableType === "AI Dataset / Weights"
                      ? "https://huggingface.co/datasets/... or IPFS"
                      : deliverableType === "Deployment Receipt"
                      ? "https://explorer.solana.com/tx/..."
                      : "https://github.com/org/repo/pull/42"
                  }
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
                  Execution Proof / Verifier Notes
                </label>
                <textarea
                  rows={3}
                  disabled={loading}
                  placeholder={
                    deliverableType === "Social / Verification Proof (X, Telegram, Discord)"
                      ? "Account handle, action timestamp, follow confirmation, and verification evidence."
                      : deliverableType === "Content / Article / Video Link"
                      ? "Summary of content published, reach metrics, and link verification."
                      : deliverableType === "Security Audit / Report"
                      ? "Executive summary of audit findings, severity breakdown, and remediation confirmation."
                      : deliverableType === "Custom / Live Web Proof"
                      ? "Summary of deliverable criteria met, counterparty instructions, and verification notes."
                      : deliverableType === "Figma / Design URL"
                      ? "Summary of frame index, typography tokens, auto-layout variants, and handoff notes."
                      : deliverableType === "Research Doc / Whitepaper"
                      ? "Executive takeaways, data sources, simulation methodology, and key risk assumptions."
                      : deliverableType === "AI Dataset / Weights"
                      ? "Dataset split distribution, validation loss, schema specs, and benchmark verification."
                      : deliverableType === "Deployment Receipt"
                      ? "Environment target (Devnet/Mainnet), program IDs, configuration hashes, and test signatures."
                      : "Summary of benchmark results, test coverage, and deployment verification."
                  }
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
