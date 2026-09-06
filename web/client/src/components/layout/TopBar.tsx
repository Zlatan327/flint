// Black Ledger style reminder: the top bar is an instrument strip—quiet, ruled, and state-led.

import { ArrowUpRight, ArrowDownLeft, Menu, Wallet, X, Bot } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { navItems } from "@/lib/flint-data";
import { useFlintWallet } from "@/contexts/WalletContext";
import { WalletModal } from "@/components/wallet/WalletModal";
import { SendWithdrawModal } from "@/components/wallet/SendWithdrawModal";
import { DepositModal } from "@/components/wallet/DepositModal";
import { AccountDrawer } from "@/components/wallet/AccountDrawer";
import { AgentConsoleModal } from "@/components/protocol/AgentConsoleModal";

export function TopBar() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAgentConsoleOpen, setIsAgentConsoleOpen] = useState(false);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);
  const {
    connected,
    walletAddress,
    balance,
    setIsModalOpen,
    disconnectWallet,
    openSendModal,
    openDepositModal,
  } = useFlintWallet();

  return (
    <header className="topbar">
      <Link href="/" className="brand-lockup" aria-label="FLINT home">
        <span className="brand-mark" aria-hidden="true">
          <span className="brand-mark-cut" />
        </span>
        <span className="brand-name">FLINT</span>
        <span className="brand-subtitle">GIG PROTOCOL</span>
      </Link>

      <nav className={`topbar-nav ${menuOpen ? "topbar-nav-open" : ""}`} aria-label="Primary navigation">
        {navItems.map((item, index) => {
          const isAnchor = item.href.startsWith("/#");
          const isActive = !isAnchor && (location === item.href || (item.href !== "/" && location.startsWith(item.href)));
          const handleClick = (e: React.MouseEvent) => {
            setMenuOpen(false);
            if (isAnchor && window.location.pathname === "/") {
              e.preventDefault();
              const targetId = item.href.replace("/#", "");
              const elem = document.getElementById(targetId);
              if (elem) {
                elem.scrollIntoView({ behavior: "smooth" });
                window.history.pushState(null, "", `#${targetId}`);
              }
            }
          };

          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? "active" : ""}
              onClick={handleClick}
            >
              <span className="nav-index">0{index + 1}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}

        {/* Mobile menu drawer footer — hidden on desktop, only displays in mobile menu drawer */}
        <div className="mobile-nav-footer">
          {connected && walletAddress && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", width: "100%", marginBottom: "8px" }}>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); openDepositModal(); }}
                className="mono"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "8px",
                  fontSize: "0.75rem",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  color: "#10b981",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                <ArrowDownLeft size={14} /> DEPOSIT
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); openSendModal(); }}
                className="mono"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "8px",
                  fontSize: "0.75rem",
                  background: "rgba(255, 107, 0, 0.12)",
                  border: "1px solid rgba(255, 107, 0, 0.3)",
                  color: "#FF6B00",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                <ArrowUpRight size={14} /> SEND
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => { setMenuOpen(false); setIsAgentConsoleOpen(true); }}
            className="mobile-agent-btn mono"
          >
            <Bot size={15} />
            <span>OPEN AGENT API CONSOLE</span>
          </button>
          <div className="mobile-telemetry mono">
            <span className="status-dot status-dot-live" />
            <span>DEVNET L1 · MAGICBLOCK ROLLUP</span>
          </div>
        </div>
      </nav>

      <div className="topbar-actions">
        {/* Network & Rollup Status Pill */}
        <div className="network-state" title="Solana Devnet L1 · MagicBlock Rollup Live (<10ms latency)">
          <span className="status-dot status-dot-live" />
          <span className="network-env">DEVNET L1</span>
          <span className="network-sep">·</span>
          <span className="network-name">MAGICBLOCK ROLLUP</span>
        </div>

        {/* Agent API Console Trigger */}
        <button
          type="button"
          onClick={() => setIsAgentConsoleOpen(true)}
          className="mono agent-api-btn"
          title="Open Agent API & RPC Docs"
        >
          <Bot size={13} />
          <span className="agent-api-label">AGENT API</span>
        </button>

        {/* Wallet Connection */}
        {connected && walletAddress ? (
          <div className="wallet-connected-group">
            <button
              type="button"
              className="topbar-fund-btn topbar-fund-btn-deposit mono"
              onClick={openDepositModal}
              title="Deposit Devnet SOL"
            >
              <ArrowDownLeft size={12} />
              <span>DEPOSIT</span>
            </button>
            <button
              type="button"
              className="topbar-fund-btn topbar-fund-btn-send mono"
              onClick={openSendModal}
              title="Send / Withdraw SOL to any wallet"
            >
              <ArrowUpRight size={12} />
              <span>SEND</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAccountDrawerOpen(true)}
              className="wallet-account-btn mono"
              title="Open Account & Balance Management"
            >
              <span className="status-dot status-dot-live" />
              <span className="wallet-addr-text">
                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </span>
              {balance !== null && (
                <span className="topbar-balance">
                  {balance.toFixed(3)} SOL
                </span>
              )}
            </button>
            <button
              type="button"
              className="topbar-disconnect-btn mono"
              onClick={disconnectWallet}
              title="Disconnect Wallet"
            >
              DISCONNECT
            </button>
          </div>
        ) : (
          <button className="wallet-button" type="button" onClick={() => setIsModalOpen(true)}>
            <Wallet size={14} />
            <span>CONNECT WALLET</span>
            <ArrowUpRight size={13} />
          </button>
        )}

        {/* Mobile Menu Hamburger */}
        <button
          className="icon-button mobile-menu"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>
      <WalletModal />
      <SendWithdrawModal />
      <DepositModal />
      <AccountDrawer
        isOpen={isAccountDrawerOpen}
        onClose={() => setIsAccountDrawerOpen(false)}
        onSwitchWallet={() => {
          setIsAccountDrawerOpen(false);
          setIsModalOpen(true);
        }}
      />
      <AgentConsoleModal
        isOpen={isAgentConsoleOpen}
        onClose={() => setIsAgentConsoleOpen(false)}
      />
    </header>
  );
}
