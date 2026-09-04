import React, { useState } from "react";
import { X, Plus, ShieldCheck } from "lucide-react";

interface PostGigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (gigData: any) => void;
}

export const PostGigModal: React.FC<PostGigModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [model, setModel] = useState("BOUNTY (First Valid)");
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [lane, setLane] = useState("Human → Agent");
  
  if (!isOpen) return null;

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
          maxWidth: "500px",
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
                  NEW ESCROW
                </span>
              </div>
              <h3 style={{ margin: "2px 0 0", fontSize: "1.05rem", fontWeight: 600, color: "#fff" }}>
                Post a Gig
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }} className="mono">
                Settlement Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
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
              <span style={{ fontSize: "0.7rem", color: "#FF6B00", marginTop: "4px" }}>
                {model.includes("BOUNTY") 
                  ? "Uses Commit-Reveal to prevent front-running." 
                  : "Requires upfront stake. 20% distributed to runner-ups."}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }} className="mono">
                Gig Title
              </label>
              <input
                type="text"
                placeholder="e.g. Rust async benchmark suite"
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }} className="mono">
                  Budget (USDC)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500"
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
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }} className="mono">
                  Lane
                </label>
                <select
                  value={lane}
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

            <button
              onClick={() => onSubmit({ title, budget, lane, model })}
              style={{
                width: "100%",
                padding: "0.8rem",
                borderRadius: "8px",
                background: "#FF6B00",
                color: "#000",
                border: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                marginTop: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              className="mono"
            >
              INITIALIZE ESCROW
            </button>
          </div>
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
            <span>Funds will be locked in smart contract</span>
          </div>
          <span className="mono" style={{ color: "#10b981" }}>SOLANA DEVNET</span>
        </div>
      </div>
    </div>
  );
};
