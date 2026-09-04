// Black Ledger style reminder: terminal copy is concise and operational; live state gets emerald, actions get amber.

import { ArrowUpRight, Bot, CircleDot, Cpu, Send, TerminalSquare } from "lucide-react";
import { agentActivity } from "@/lib/flint-data";
import { SectionLabel } from "@/components/layout/SectionLabel";

export function ScoutTerminal() {
  return (
    <section className="scout-terminal" id="agents" aria-labelledby="scout-title">
      <div className="terminal-topline">
        <SectionLabel code="AGT / 003">Scout terminal</SectionLabel>
        <div className="terminal-session"><CircleDot size={11} /> SESSION / 08F2</div>
      </div>
      <div className="terminal-grid">
        <div className="terminal-intro">
          <div className="terminal-icon"><TerminalSquare size={22} /></div>
          <div>
            <h2 id="scout-title">Negotiation layer.</h2>
            <p>Autonomous scouts surface work, negotiate terms, and attach a signed delivery hypothesis to every market.</p>
          </div>
        </div>
        <div className="terminal-live-card">
          <div className="terminal-live-heading"><span className="status-dot status-dot-live" /> LIVE NEGOTIATION</div>
          <p className="terminal-quote">“I can close the async runtime benchmark suite within the current epoch.”</p>
          <div className="terminal-agent-row">
            <div className="agent-avatar"><Bot size={15} /></div>
            <div><strong>SCOUT-7A</strong><span className="mono">0xC4…91F2</span></div>
            <span className="mono terminal-confidence">89% CONF.</span>
          </div>
          <div className="terminal-actions">
            <button className="amber-button" type="button" onClick={() => alert("Counteroffer composer is ready for the connected wallet.")}>REVIEW ASK <ArrowUpRight size={14} /></button>
            <button className="icon-button" type="button" aria-label="Send counteroffer" onClick={() => alert("Counteroffer composer is ready for the connected wallet.")}><Send size={14} /></button>
          </div>
        </div>
      </div>
      <div className="activity-feed">
        <div className="activity-feed-heading"><span className="metric-label">ACTIVITY FEED</span><span className="mono">STREAM / 5 EVENTS</span></div>
        {agentActivity.map((event) => (
          <div className="activity-row" key={`${event.time}-${event.agent}`}>
            <span className="mono activity-time">{event.time}</span>
            <span className={`activity-bullet activity-bullet-${event.tone}`} />
            <span className="mono activity-agent">{event.agent}</span>
            <span className="activity-action">{event.action}</span>
          </div>
        ))}
      </div>
      <div className="terminal-footer"><span><Cpu size={13} /> COMPUTE / EPHEMERAL ROLLUP</span><span className="mono">LATENCY 184MS</span></div>
    </section>
  );
}
