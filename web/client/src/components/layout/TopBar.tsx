// Black Ledger style reminder: the top bar is an instrument strip—quiet, ruled, and state-led.

import { ArrowUpRight, Menu, Radio, Wallet, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { navItems } from "@/lib/flint-data";
import { useFlintWallet } from "@/contexts/WalletContext";
import { WalletModal } from "@/components/wallet/WalletModal";

export function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { connected, walletAddress, balance, setIsModalOpen, disconnectWallet } = useFlintWallet();

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
            <Link key={item.href} href={item.href} onClick={handleClick}>
              <span className="nav-index">0{index + 1}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="topbar-actions">
        <div className="network-state">
          <span className="status-dot status-dot-live" />
          <span className="mono">ROLLUP / LIVE</span>
          <span className="network-name">MAGICBLOCK</span>
        </div>
        <button className="icon-button mobile-menu" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {connected && walletAddress ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              className="mono"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "0.78rem",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
              <span style={{ color: "#fff", fontWeight: 600 }}>
                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </span>
              {balance !== null && (
                <span style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
                  {balance.toFixed(3)} SOL
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={disconnectWallet}
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "0.7rem",
                padding: "6px 10px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)")}
            >
              DISCONNECT
            </button>
          </div>
        ) : (
          <button className="wallet-button" type="button" onClick={() => setIsModalOpen(true)}>
            <Wallet size={15} />
            <span>CONNECT WALLET</span>
            <ArrowUpRight size={14} />
          </button>
        )}
      </div>
      <WalletModal />
    </header>
  );
}
