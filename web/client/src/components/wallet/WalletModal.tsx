import React from "react";
import { X, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useFlintWallet, WalletOption } from "@/contexts/WalletContext";
import {
  PhantomIcon,
  SolflareIcon,
  BackpackIcon,
  CoinbaseIcon,
  OKXIcon,
  FlintSignerIcon,
} from "./WalletIcons";

const renderWalletIcon = (iconId: string) => {
  switch (iconId) {
    case "phantom":
      return <PhantomIcon size={32} />;
    case "solflare":
      return <SolflareIcon size={32} />;
    case "backpack":
      return <BackpackIcon size={32} />;
    case "coinbase":
      return <CoinbaseIcon size={32} />;
    case "okx":
      return <OKXIcon size={32} />;
    case "flint":
      return <FlintSignerIcon size={32} />;
    default:
      return <div style={{ width: 32, height: 32, borderRadius: 6, background: "#333" }} />;
  }
};

export const WalletModal: React.FC = () => {
  const { isModalOpen, setIsModalOpen, availableWallets, connectWallet, connecting } = useFlintWallet();

  if (!isModalOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 150ms ease-out",
      }}
      onClick={() => setIsModalOpen(false)}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          margin: "1rem",
          backgroundColor: "#0d0f14",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "10px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
              <span className="mono" style={{ fontSize: "0.72rem", color: "#10b981", letterSpacing: "0.08em", fontWeight: 700 }}>
                SOLANA WALLET STANDARD
              </span>
            </div>
            <h3 style={{ margin: "4px 0 0", fontSize: "1.1rem", fontWeight: 600, color: "#fff" }}>
              Connect a Wallet
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
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

        {/* Wallet Options List */}
        <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {availableWallets.map((wallet: WalletOption) => (
            <button
              key={wallet.id}
              type="button"
              disabled={connecting}
              onClick={() => connectWallet(wallet)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(255, 255, 255, 0.02)",
                cursor: connecting ? "not-allowed" : "pointer",
                transition: "all 120ms ease",
                textAlign: "left",
                color: "#fff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {renderWalletIcon(wallet.icon)}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{wallet.name}</span>
                    {wallet.isInstalled && (
                      <span
                        className="mono"
                        style={{
                          fontSize: "0.62rem",
                          background: "rgba(16, 185, 129, 0.15)",
                          color: "#10b981",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          padding: "1px 5px",
                          borderRadius: "3px",
                        }}
                      >
                        DETECTED
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.45)" }}>
                    {wallet.description}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "rgba(255, 255, 255, 0.4)", fontSize: "0.75rem" }}>
                {wallet.isInstalled ? (
                  <CheckCircle2 size={15} color="#10b981" />
                ) : (
                  <>
                    <span className="mono" style={{ fontSize: "0.68rem" }}>INSTALL</span>
                    <ExternalLink size={12} />
                  </>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Modal Footer */}


        <div
          style={{
            padding: "1rem 1.5rem",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.7rem",
            color: "rgba(255, 255, 255, 0.4)",
          }}
        >
          <ShieldCheck size={14} color="#10b981" />
          <span>Non-custodial. Cryptographically signed on Solana Devnet.</span>
        </div>
      </div>
    </div>
  );
};
