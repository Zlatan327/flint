import React, { useState } from "react";
import { X, Copy, Check, ExternalLink, RefreshCw, LogOut, ArrowRight, ShieldCheck, Award, Wallet, Droplet, Loader2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useFlintWallet } from "@/contexts/WalletContext";
import { Link } from "wouter";

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchWallet: () => void;
}

export const AccountDrawer: React.FC<AccountDrawerProps> = ({
  isOpen,
  onClose,
  onSwitchWallet,
}) => {
  const {
    walletAddress,
    walletName,
    balance,
    disconnectWallet,
    requestAirdrop,
    refreshBalance,
    openSendModal,
    openDepositModal,
  } = useFlintWallet();
  const [copied, setCopied] = useState(false);
  const [airdropping, setAirdropping] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [airdropMsg, setAirdropMsg] = useState<string | null>(null);

  if (!isOpen || !walletAddress) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAirdrop = async () => {
    try {
      setAirdropping(true);
      setAirdropMsg(null);
      await requestAirdrop();
      setAirdropMsg("1 SOL successfully requested from Devnet faucet!");
      setTimeout(() => setAirdropMsg(null), 4000);
    } catch (err: any) {
      setAirdropMsg(err?.message || "Devnet airdrop rate limit reached. Please try later or use solfaucet.com.");
    } finally {
      setAirdropping(false);
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

  const handleDisconnect = () => {
    disconnectWallet();
    onClose();
  };

  const explorerUrl = `https://explorer.solana.com/address/${walletAddress}?cluster=devnet`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          height: "100%",
          backgroundColor: "#0a0c10",
          borderLeft: "1px solid rgba(255, 255, 255, 0.12)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-20px 0 50px rgba(0, 0, 0, 0.9)",
          overflowY: "auto",
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <span className="mono" style={{ fontSize: "0.8rem", color: "#fff", fontWeight: 700 }}>
              {walletName?.toUpperCase() || "SOLANA WALLET"}
            </span>
            <span className="mono" style={{ fontSize: "0.65rem", padding: "2px 6px", borderRadius: "4px", background: "rgba(255, 255, 255, 0.06)", color: "rgba(255, 255, 255, 0.5)" }}>
              DEVNET
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
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
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", flex: 1 }}>
          {/* Address Box */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mono" style={{ fontSize: "0.68rem", color: "rgba(255, 255, 255, 0.5)" }}>
                CONNECTED ACCOUNT
              </span>
              <span className="mono" style={{ fontSize: "0.68rem", color: "#10b981" }}>
                ACTIVE
              </span>
            </div>

            <div className="mono" style={{ fontSize: "0.82rem", color: "#fff", wordBreak: "break-all", lineHeight: "1.3" }}>
              {walletAddress}
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "5px 10px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "6px",
                  color: copied ? "#10b981" : "#fff",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                }}
                className="mono"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "COPIED" : "COPY"}
              </button>

              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "5px 10px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "6px",
                  color: "#38bdf8",
                  fontSize: "0.72rem",
                  textDecoration: "none",
                }}
                className="mono"
              >
                EXPLORER <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* Balance & Devnet Faucet Card */}
          <div
            style={{
              background: "rgba(255, 107, 0, 0.04)",
              border: "1px solid rgba(255, 107, 0, 0.2)",
              borderRadius: "10px",
              padding: "1.2rem",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mono" style={{ fontSize: "0.68rem", color: "rgba(255, 255, 255, 0.5)" }}>
                DEVNET SOL BALANCE
              </span>
              <button
                type="button"
                onClick={handleRefresh}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "2px" }}
                title="Refresh balance"
              >
                <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="mono" style={{ fontSize: "2rem", fontWeight: 700, color: "#fff" }}>
              {balance !== null ? balance.toFixed(4) : "—"}{" "}
              <span style={{ fontSize: "1rem", color: "#FF6B00" }}>SOL</span>
            </div>

            {/* Quick Actions: Deposit & Send/Withdraw */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openDepositModal();
                }}
                className="mono"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "8px",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "6px",
                  color: "#10b981",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 160ms var(--ease-out)",
                }}
              >
                <ArrowDownLeft size={14} /> DEPOSIT
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  openSendModal();
                }}
                className="mono"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "8px",
                  background: "rgba(255, 107, 0, 0.12)",
                  border: "1px solid rgba(255, 107, 0, 0.3)",
                  borderRadius: "6px",
                  color: "#FF6B00",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 160ms var(--ease-out)",
                }}
              >
                <ArrowUpRight size={14} /> SEND
              </button>
            </div>

            <button
              type="button"
              disabled={airdropping}
              onClick={handleAirdrop}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "8px 12px",
                background: "rgba(255, 107, 0, 0.12)",
                border: "1px solid rgba(255, 107, 0, 0.3)",
                borderRadius: "6px",
                color: "#FF6B00",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: airdropping ? "not-allowed" : "pointer",
                marginTop: "4px",
              }}
              className="mono"
            >
              {airdropping ? <Loader2 size={13} className="animate-spin" /> : <Droplet size={13} />}
              {airdropping ? "REQUESTING AIRDROP..." : "REQUEST 1 SOL (DEVNET FAUCET)"}
            </button>

            {airdropMsg && (
              <span className="mono" style={{ fontSize: "0.68rem", color: airdropMsg.includes("success") ? "#10b981" : "#f59e0b" }}>
                {airdropMsg}
              </span>
            )}
          </div>

          {/* User Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span className="mono" style={{ fontSize: "0.68rem", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>
              User Surfaces
            </span>

            <Link
              href="/passport"
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "8px",
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.82rem",
              }}
              className="mono"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={16} color="#FF6B00" />
                <span>BUILDER PASSPORT</span>
              </div>
              <ArrowRight size={14} color="rgba(255,255,255,0.4)" />
            </Link>

            <Link
              href="/exchange"
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "8px",
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.82rem",
              }}
              className="mono"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={16} color="#10b981" />
                <span>MY GIGS & ESCROWS</span>
              </div>
              <ArrowRight size={14} color="rgba(255,255,255,0.4)" />
            </Link>

            <Link
              href="/markets"
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "8px",
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.82rem",
              }}
              className="mono"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Wallet size={16} color="#38bdf8" />
                <span>PREDICTION POSITIONS</span>
              </div>
              <ArrowRight size={14} color="rgba(255,255,255,0.4)" />
            </Link>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "1.2rem 1.5rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchWallet();
            }}
            style={{
              width: "100%",
              padding: "9px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "0.78rem",
              cursor: "pointer",
            }}
            className="mono"
          >
            SWITCH WALLET PROVIDER
          </button>

          <button
            type="button"
            onClick={handleDisconnect}
            style={{
              width: "100%",
              padding: "9px",
              background: "rgba(225, 29, 72, 0.08)",
              border: "1px solid rgba(225, 29, 72, 0.25)",
              borderRadius: "6px",
              color: "#f43f5e",
              fontSize: "0.78rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
            className="mono"
          >
            <LogOut size={13} /> DISCONNECT WALLET
          </button>
        </div>
      </div>
    </div>
  );
};
