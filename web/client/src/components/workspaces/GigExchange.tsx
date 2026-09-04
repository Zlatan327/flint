import { gigs } from "@/lib/flint-data";
import { ArrowUpRight, Filter, Plus } from "lucide-react";
import { useFlintWallet } from "@/contexts/WalletContext";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { PostGigModal } from "./PostGigModal";
import { useState } from "react";

export function GigExchange() {
  const { connected, setIsModalOpen } = useFlintWallet();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const handleInteract = (action: string) => {
    if (!connected) return setIsModalOpen(true);
    alert(`Sending transaction to Escrow Program... (Action: ${action})`);
  };

  const handlePostGig = (gigData: any) => {
    alert(`Initializing Escrow for ${gigData.title} with budget ${gigData.budget} USDC...\nModel: ${gigData.model}`);
    setIsPostModalOpen(false);
  };

  return (
    <section className="workspace-section prediction-workspace" id="gigs" aria-labelledby="gig-title">
      <div className="workspace-heading">
        <div>
          <SectionLabel code="EXC / 001" tone="amber">Gig Exchange</SectionLabel>
          <h2 id="gig-title">Anonymous work market.</h2>
          <p>Browse live gigs, submit without exposing your counterparty, and track the moment escrow routes to the worker.</p>
        </div>
        <div className="market-balance-card">
          <span className="metric-label">CREATE NEW</span>
          <strong className="mono">ESCROW CONTRACT</strong>
          <button 
            type="button" 
            onClick={() => connected ? setIsPostModalOpen(true) : setIsModalOpen(true)}
          >
            {connected ? "POST GIG" : "CONNECT WALLET"} <Plus size={13} />
          </button>
        </div>
      </div>

      <div className="prediction-layout">
        <div className="market-book">
          <div className="panel-title-row">
            <span className="metric-label">LIVE GIGS</span>
            <span className="mono">BUDGET / STATUS</span>
          </div>
          {gigs.map((gig) => (
            <article className="market-book-row" key={gig.id}>
              <div className="market-book-main">
                <span className="mono market-book-id">{gig.id}</span>
                <h3>{gig.title}</h3>
                <span className="mono market-book-meta">
                  {gig.lane} · {gig.verification} · CLOSES {gig.deadline}
                </span>
              </div>
              <div className="market-book-prob">
                <span className="metric-label">BUDGET</span>
                <strong className="mono">{gig.budget}</strong>
                <span className="market-trend">{gig.submissions} SUBMISSIONS</span>
              </div>
              <div className="market-book-actions">
                {gig.status === "Accepting" ? (
                  <button className="amber-button" onClick={() => handleInteract("submit")}>
                    SUBMIT WORK
                  </button>
                ) : (
                  <button className="outline-button" onClick={() => handleInteract("view_escrow")}>
                    VIEW ESCROW
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        <aside className="positions-panel">
          <div className="panel-title-row">
            <span className="metric-label">FILTER GIGS</span>
            <Filter size={15} />
          </div>
          <div className="balance-ledger">
            <div style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
              <span style={{ color: '#e5e5e5' }}>Settlement Model</span>
              <select className="mono" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '2px 4px', width: '100%', marginTop: '4px' }}>
                <option>ALL MODELS</option>
                <option>BOUNTY (First Valid)</option>
                <option>CONTEST (Best Wins)</option>
              </select>
            </div>
            <div style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
              <span style={{ color: '#e5e5e5' }}>Lane</span>
              <select className="mono" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '2px 4px', width: '100%', marginTop: '4px' }}>
                <option>ALL LANES</option>
                <option>Human → Agent</option>
                <option>Agent → Agent</option>
                <option>Human → Human</option>
              </select>
            </div>
            <div style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
              <span style={{ color: '#e5e5e5' }}>Verification</span>
              <select className="mono" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '2px 4px', width: '100%', marginTop: '4px' }}>
                <option>ANY REQUIRED</option>
                <option>GITHUB + WALLET</option>
                <option>SBT ATTESTED</option>
                <option>ESCROW READY</option>
              </select>
            </div>
            <div style={{ paddingBottom: '12px' }}>
              <span style={{ color: '#e5e5e5' }}>Status</span>
              <select className="mono" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '2px 4px', width: '100%', marginTop: '4px' }}>
                <option>ALL STATUS</option>
                <option>Accepting</option>
                <option>Reviewing</option>
                <option>Funded</option>
              </select>
            </div>
          </div>
        </aside>
      </div>

      <PostGigModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        onSubmit={handlePostGig} 
      />
    </section>
  );
}
