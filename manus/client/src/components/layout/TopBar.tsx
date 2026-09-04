// Black Ledger style reminder: the top bar is an instrument strip—quiet, ruled, and state-led.

import { ArrowUpRight, Menu, Radio, Wallet, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/lib/flint-data";

export function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <a className="brand-lockup" href="#top" aria-label="FLINT home">
        <span className="brand-mark" aria-hidden="true">
          <span className="brand-mark-cut" />
        </span>
        <span className="brand-name">FLINT</span>
        <span className="brand-subtitle">GIG PROTOCOL</span>
      </a>

      <nav className={`topbar-nav ${menuOpen ? "topbar-nav-open" : ""}`} aria-label="Primary navigation">
        {navItems.map((item, index) => (
          <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
            <span className="nav-index">0{index + 1}</span>
            {item.label}
          </a>
        ))}
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
        <button className="wallet-button" type="button" onClick={() => alert("Wallet adapter connection is ready for integration.")}>
          <Wallet size={15} />
          <span>CONNECT WALLET</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </header>
  );
}
