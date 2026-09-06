import React, { useState } from "react";
import {
  X,
  ArrowDownLeft,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Droplet,
  Loader2,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { useFlintWallet } from "@/contexts/WalletContext";

export const DepositModal: React.FC = () => {
  const {
    connected,
    walletAddress,
    walletName,
    balance,
    refreshBalance,
    requestAirdrop,
    isDepositModalOpen,
    setIsDepositModalOpen,
    setIsModalOpen,
  } = useFlintWallet();

  const [copied, setCopied] = useState(false);
  const [airdropping, setAirdropping] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [airdropMsg, setAirdropMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isDepositModalOpen) return null;

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshBalance();
    } finally {
      setRefreshing(false);
    }
  };

  const handleAirdrop = async () => {
    if (!walletAddress) {
      setIsModalOpen(true);
      return;
    }

    try {
      setAirdropping(true);
      setAirdropMsg(null);
      await requestAirdrop();
      setAirdropMsg({
        type: "success",
        text: "1.0 SOL Devnet airdrop requested successfully! Updating balance...",
      });
      setTimeout(async () => {
        await refreshBalance();
      }, 2500);
    } catch (err: any) {
      setAirdropMsg({
        type: "error",
        text: err?.message || "Devnet RPC faucet rate limited. Try solfaucet.com or try again shortly.",
      });
    } finally {
      setAirdropping(false);
    }
  };

  const explorerUrl = walletAddress
    ? `https://explorer.solana.com/address/${walletAddress}?cluster=devnet`
    : "#";

  const qrCodeUrl = walletAddress
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
        walletAddress
      )}&bgcolor=0a0c10&color=ffffff&margin=10`
    : "";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(10px)",
      }}
      onClick={() => setIsDepositModalOpen(false)}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
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
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowDownLeft size={18} color="#10b981" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="mono" style={{ fontSize: "0.68rem", color: "#10b981", letterSpacing: "0.08em", fontWeight: 700 }}>
                  TREASURY / INFLOW
                </span>
                <span className="mono" style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: "4px", background: "rgba(255, 255, 255, 0.06)", color: "rgba(255, 255, 255, 0.5)" }}>
                  DEVNET L1
                </span>
              </div>
              <h3 style={{ margin: "2px 0 0", fontSize: "1.05rem", fontWeight: 600, color: "#fff" }}>
                Deposit SOL
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDepositModalOpen(false)}
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "rgba(255, 255, 255, 0.6)",
              padding: "6px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {connected && walletAddress ? (
            <>
              {/* QR Code Card */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "1.2rem",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  gap: "10px",
                }}
              >
                {qrCodeUrl && (
                  <div
                    style={{
                      padding: "8px",
                      background: "#0a0c10",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={qrCodeUrl}
                      alt="Solana Wallet QR Code"
                      width={160}
                      height={160}
                      style={{ display: "block", borderRadius: "6px" }}
                    />
                  </div>
                )}
                <span className="mono" style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)" }}>
                  Scan to transfer from mobile wallet (Phantom, OKX, Solflare)
                </span>
              </div>

              {/* Address Box */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="mono" style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", letterSpacing: "0.04em" }}>
                    YOUR SOLANA RECEIVING ADDRESS
                  </label>
                  <span className="mono" style={{ fontSize: "0.68rem", color: "#10b981" }}>
                    {walletName?.toUpperCase() || "CONNECTED"}
                  </span>
                </div>

                <div
                  style={{
                    padding: "10px 12px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                  className="mono"
                >
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "#fff",
                      wordBreak: "break-all",
                      lineHeight: "1.3",
                    }}
                  >
                    {walletAddress}
                  </span>

                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      padding: "6px 10px",
                      background: copied ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)",
                      border: copied ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "6px",
                      color: copied ? "#10b981" : "#fff",
                      fontSize: "0.72rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      flexShrink: 0,
                      fontWeight: 600,
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "COPIED" : "COPY"}
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono"
                    style={{
                      fontSize: "0.7rem",
                      color: "#38bdf8",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    VIEW ON SOLANA EXPLORER <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              {/* Balance & Devnet Faucet Request */}
              <div
                style={{
                  padding: "12px",
                  background: "rgba(16, 185, 129, 0.05)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  borderRadius: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Wallet size={14} color="#10b981" />
                    <span className="mono" style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.7)" }}>
                      CURRENT DEVNET BALANCE:
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <strong className="mono" style={{ color: "#fff", fontSize: "0.95rem" }}>
                      {balance !== null ? balance.toFixed(4) : "—"} SOL
                    </strong>
                    <button
                      type="button"
                      onClick={handleRefresh}
                      style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "2px" }}
                      title="Refresh balance"
                    >
                      <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={airdropping}
                  onClick={handleAirdrop}
                  className="mono"
                  style={{
                    width: "100%",
                    padding: "9px",
                    background: airdropping ? "rgba(16, 185, 129, 0.1)" : "#10b981",
                    color: airdropping ? "rgba(255, 255, 255, 0.4)" : "#000",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: airdropping ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 160ms var(--ease-out)",
                  }}
                >
                  {airdropping ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      REQUESTING DEVNET AIRDROP...
                    </>
                  ) : (
                    <>
                      <Droplet size={14} />
                      REQUEST 1.0 SOL (DEVNET FAUCET)
                    </>
                  )}
                </button>

                {airdropMsg && (
                  <span
                    className="mono"
                    style={{
                      fontSize: "0.7rem",
                      color: airdropMsg.type === "success" ? "#10b981" : "#f59e0b",
                      textAlign: "center",
                    }}
                  >
                    {airdropMsg.text}
                  </span>
                )}
              </div>

              {/* Guidance Info */}
              <div
                style={{
                  padding: "10px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                className="mono"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>
                  <ShieldCheck size={14} color="#10b981" />
                  <span>Alternative faucet:</span>
                </div>
                <a
                  href="https://solfaucet.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#FF6B00", textDecoration: "underline", fontSize: "0.72rem" }}
                  className="mono"
                >
                  solfaucet.com ↗
                </a>
              </div>
            </>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
              <Wallet size={36} color="rgba(255,255,255,0.3)" />
              <h4 style={{ color: "#fff", margin: 0 }}>No Wallet Connected</h4>
              <p className="mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: 0 }}>
                Please connect your Solana wallet to view your deposit address.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsDepositModalOpen(false);
                  setIsModalOpen(true);
                }}
                className="amber-button mono"
                style={{ marginTop: "8px" }}
              >
                CONNECT WALLET
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};