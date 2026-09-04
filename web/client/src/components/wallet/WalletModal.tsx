import React, { useState } from "react";
import { X, ExternalLink, ShieldCheck, CheckCircle2, QrCode, Search, Sparkles, ArrowRight } from "lucide-react";
import { useFlintWallet, WalletOption } from "@/contexts/WalletContext";
import {
  PhantomIcon,
  SolflareIcon,
  BackpackIcon,
  CoinbaseIcon,
  OKXIcon,
  FlintSignerIcon,
  WalletConnectIcon,
  TrustWalletIcon,
  RainbowIcon,
  LedgerIcon,
} from "./WalletIcons";

const renderWalletIcon = (iconId: string) => {
  switch (iconId) {
    case "walletconnect":
      return <WalletConnectIcon size={32} />;
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
    case "trust":
      return <TrustWalletIcon size={32} />;
    case "rainbow":
      return <RainbowIcon size={32} />;
    case "ledger":
      return <LedgerIcon size={32} />;
    case "flint":
      return <FlintSignerIcon size={32} />;
    default:
      return <div style={{ width: 32, height: 32, borderRadius: 6, background: "#333" }} />;
  }
};

export const WalletModal: React.FC = () => {
  const { isModalOpen, setIsModalOpen, availableWallets, connectWallet, openWalletConnect, connecting } = useFlintWallet();
  const [searchQuery, setSearchQuery] = useState("");

  if (!isModalOpen) return null;

  const extensionWallets = availableWallets.filter((w) => w.id !== "walletconnect");
  const filteredWallets = extensionWallets.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      onClick={() => setIsModalOpen(false)}
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
        {/* Modal Header */}
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
            <WalletConnectIcon size={28} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="mono" style={{ fontSize: "0.68rem", color: "#3B99FC", letterSpacing: "0.08em", fontWeight: 700 }}>
                  WALLETCONNECT
                </span>
                <span style={{ fontSize: "0.6rem", background: "rgba(59, 153, 252, 0.15)", color: "#3B99FC", padding: "1px 5px", borderRadius: "3px" }} className="mono">
                  SOLANA
                </span>
              </div>
              <h3 style={{ margin: "2px 0 0", fontSize: "1.05rem", fontWeight: 600, color: "#fff" }}>
                Connect Any Wallet
              </h3>
            </div>
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

        <div style={{ padding: "1.25rem 1.5rem" }}>
          {/* Official WalletConnect Hero Action Card */}
          <div
            style={{
              padding: "1.1rem",
              borderRadius: "10px",
              background: "linear-gradient(135deg, rgba(59, 153, 252, 0.12) 0%, rgba(59, 153, 252, 0.03) 100%)",
              border: "1px solid rgba(59, 153, 252, 0.3)",
              marginBottom: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <WalletConnectIcon size={36} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "#fff" }}>
                      WalletConnect Universal
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: "0.6rem",
                        background: "rgba(59, 153, 252, 0.2)",
                        color: "#60a5fa",
                        border: "1px solid rgba(59, 153, 252, 0.4)",
                        padding: "1px 5px",
                        borderRadius: "3px",
                      }}
                    >
                      300+ WALLETS
                    </span>
                  </div>
                  <p style={{ margin: "2px 0 0", fontSize: "0.74rem", color: "rgba(255, 255, 255, 0.6)" }}>
                    Scan QR code with Phantom, Solflare, Coinbase, Rainbow, or any mobile wallet.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openWalletConnect}
              style={{
                width: "100%",
                padding: "0.7rem 1rem",
                borderRadius: "8px",
                background: "#3B99FC",
                color: "#ffffff",
                border: "none",
                fontWeight: 600,
                fontSize: "0.84rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(59, 153, 252, 0.35)",
                transition: "background 150ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#3B99FC")}
            >
              <QrCode size={16} />
              <span>OPEN OFFICIAL WALLETCONNECT MODAL</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Section Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "1rem 0 0.85rem" }}>
            <span className="mono" style={{ fontSize: "0.68rem", color: "rgba(255, 255, 255, 0.4)", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
              OR BROWSER EXTENSIONS & DEVNET SIGNER
            </span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.08)" }} />
          </div>

          {/* Search Input */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.03)",
              marginBottom: "0.75rem",
            }}
          >
            <Search size={14} color="rgba(255,255,255,0.4)" />
            <input
              type="text"
              placeholder="Filter installed or desktop wallets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: "0.8rem",
                width: "100%",
              }}
            />
          </div>

          {/* Wallets List with custom scroll */}
          <div style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
            {filteredWallets.map((wallet: WalletOption) => (
              <button
                key={wallet.id}
                type="button"
                disabled={connecting}
                onClick={() => connectWallet(wallet)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.07)",
                  background: "rgba(255, 255, 255, 0.02)",
                  cursor: connecting ? "not-allowed" : "pointer",
                  textAlign: "left",
                  color: "#fff",
                  transition: "all 120ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.borderColor = "rgba(59, 153, 252, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {renderWalletIcon(wallet.icon)}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.86rem" }}>{wallet.name}</span>
                      {wallet.isInstalled && (
                        <span
                          className="mono"
                          style={{
                            fontSize: "0.6rem",
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "#10b981",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            padding: "1px 4px",
                            borderRadius: "3px",
                          }}
                        >
                          DETECTED
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.45)" }}>
                      {wallet.description}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "rgba(255, 255, 255, 0.4)", fontSize: "0.75rem" }}>
                  {wallet.isInstalled ? (
                    <CheckCircle2 size={14} color="#10b981" />
                  ) : (
                    <>
                      <span className="mono" style={{ fontSize: "0.65rem" }}>INSTALL</span>
                      <ExternalLink size={11} />
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
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
            <ShieldCheck size={14} color="#3b99fc" />
            <span>Official WalletConnect Protocol v2</span>
          </div>
          <span className="mono" style={{ color: "#10b981" }}>SOLANA DEVNET</span>
        </div>
      </div>
    </div>
  );
};
