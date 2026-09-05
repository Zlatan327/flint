import { ArrowUpRight, Bot, CircleDot, Cpu, ExternalLink, TerminalSquare, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Connection } from "@solana/web3.js";
import { DEVNET_RPC, ESCROW_PROGRAM_ID } from "@/lib/flint-escrow-client";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { AgentConsoleModal } from "@/components/protocol/AgentConsoleModal";

export function ScoutTerminal() {
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [signatures, setSignatures] = useState<any[]>([]);
  const [loadingSigs, setLoadingSigs] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadRecentSignatures() {
      try {
        const connection = new Connection(DEVNET_RPC, "confirmed");
        const sigs = await connection.getSignaturesForAddress(ESCROW_PROGRAM_ID, { limit: 6 });
        if (isMounted) {
          setSignatures(sigs);
        }
      } catch (err) {
        console.warn("Failed to query program signatures:", err);
      } finally {
        if (isMounted) setLoadingSigs(false);
      }
    }

    loadRecentSignatures();
    const interval = setInterval(loadRecentSignatures, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="scout-terminal" id="agents" aria-labelledby="scout-title">
      <div className="terminal-topline">
        <SectionLabel code="AGT / 003">Scout terminal</SectionLabel>
        <div className="terminal-session"><CircleDot size={11} /> RPC STREAM / LIVE</div>
      </div>
      <div className="terminal-grid">
        <div className="terminal-intro">
          <div className="terminal-icon"><TerminalSquare size={22} /></div>
          <div>
            <h2 id="scout-title">Negotiation layer.</h2>
            <p>Autonomous scouts surface work, negotiate terms, and attach signed deliverable hashes to every escrow.</p>
          </div>
        </div>
        <div className="terminal-live-card">
          <div className="terminal-live-heading"><span className="status-dot status-dot-live" /> AGENT COORDINATION</div>
          <p className="terminal-quote">“Machine-to-machine agents query open escrows and submit cryptographic deliverable proofs directly to Solana L1.”</p>
          <div className="terminal-agent-row">
            <div className="agent-avatar"><Bot size={15} /></div>
            <div><strong>FLINT AGENT RUNTIME</strong><span className="mono">DEVNET RPC</span></div>
            <span className="mono terminal-confidence">ACTIVE</span>
          </div>
          <div className="terminal-actions">
            <button className="amber-button mono" type="button" onClick={() => setIsConsoleOpen(true)}>
              AGENT API & CODE <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="activity-feed">
        <div className="activity-feed-heading">
          <span className="metric-label">DEVNET PROGRAM ACTIVITY</span>
          <span className="mono">PROGRAM: {ESCROW_PROGRAM_ID.toBase58().slice(0, 4)}...{ESCROW_PROGRAM_ID.toBase58().slice(-4)}</span>
        </div>

        {loadingSigs ? (
          <div style={{ padding: "1.5rem", textAlign: "center", color: "rgba(255,255,255,0.4)" }} className="mono">
            <Loader2 size={16} className="animate-spin inline mr-2 text-amber-500" />
            <span>Streaming Devnet transaction signatures...</span>
          </div>
        ) : signatures.length === 0 ? (
          <div style={{ padding: "1.5rem", textAlign: "center", color: "rgba(255,255,255,0.4)" }} className="mono">
            Listening for program transactions on Solana Devnet...
          </div>
        ) : (
          signatures.map((sig) => {
            const timeStr = sig.blockTime
              ? new Date(sig.blockTime * 1000).toLocaleTimeString([], { hour12: false })
              : "PENDING";
            const shortSig = `${sig.signature.slice(0, 6)}...${sig.signature.slice(-6)}`;
            const explorerUrl = `https://explorer.solana.com/tx/${sig.signature}?cluster=devnet`;

            return (
              <div className="activity-row" key={sig.signature} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="mono activity-time">{timeStr}</span>
                  <span className={`activity-bullet ${sig.err ? "activity-bullet-amber" : "activity-bullet-emerald"}`} />
                  <span className="mono activity-agent">SLOT #{sig.slot}</span>
                  <span className="activity-action">{sig.err ? "Failed Tx" : "Program Instruction Confirmed"}</span>
                </div>
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono"
                  style={{ color: "#38bdf8", fontSize: "0.72rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px" }}
                >
                  {shortSig} <ExternalLink size={11} />
                </a>
              </div>
            );
          })
        )}
      </div>
      <div className="terminal-footer">
        <span><Cpu size={13} /> SOLANA DEVNET CONSENSUS</span>
        <span className="mono">PROGRAM ID VERIFIED</span>
      </div>

      <AgentConsoleModal
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
      />
    </section>
  );
}
