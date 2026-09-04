// Black Ledger style reminder: the Prediction Market makes risk legible—current books, wallet balance, open positions, and settlement context before any action.

import { ArrowDownRight, ArrowUpRight, BarChart3, WalletCards } from "lucide-react";
import { markets, positions } from "@/lib/flint-data";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { useFlintWallet } from "@/contexts/WalletContext";

export function PredictionMarket() {
  const { connected, balance, setIsModalOpen } = useFlintWallet();
  const displayBalance = connected && balance !== null ? `${balance.toFixed(2)} SOL` : "0.00 SOL";

  return (
    <section className="workspace-section prediction-workspace" id="markets" aria-labelledby="prediction-title">
      <div className="workspace-heading">
        <div>
          <SectionLabel code="MKT / 002" tone="emerald">Prediction market</SectionLabel>
          <h2 id="prediction-title">Underwrite delivery.</h2>
          <p>Bet on whether a gig settles on time. See the book, manage positions, and keep your balance visible.</p>
        </div>
        <div className="market-balance-card">
          <WalletCards size={16} />
          <span className="metric-label">AVAILABLE BALANCE</span>
          <strong className="mono">{displayBalance}</strong>
          <button 
            type="button" 
            onClick={() => connected ? alert("Deposit/Withdraw flow coming soon") : setIsModalOpen(true)}
          >
            {connected ? "MANAGE BALANCE" : "CONNECT WALLET"} <ArrowUpRight size={13} />
          </button>
        </div>
      </div>

      <div className="market-overview-strip"><div><span className="metric-label">OPEN MARKETS</span><strong className="mono">24</strong></div><div><span className="metric-label">CAPITAL IN BOOKS</span><strong className="mono">412K USDC</strong></div><div><span className="metric-label">MY OPEN BETS</span><strong className="mono">600 USDC</strong></div><div><span className="metric-label">SETTLEMENT RATE</span><strong className="mono market-good">89.4%</strong></div></div>

      <div className="prediction-layout">
        <div className="market-book">
          <div className="panel-title-row"><span className="metric-label">CURRENT BOOK</span><span className="mono">SORT / LIQUIDITY</span></div>
          {markets.map((market) => (
            <article className="market-book-row" key={market.id}>
              <div className="market-book-main"><span className="mono market-book-id">MKT-{market.id}</span><h3>{market.title}</h3><span className="mono market-book-meta">{market.category} · CLOSES {market.expiry}</span></div>
              <div className="market-book-prob"><span className="metric-label">YES</span><strong className="mono">{market.probability}%</strong><span className="market-trend"><ArrowUpRight size={12} /> {market.change}</span></div>
              <div className="market-book-actions">
                <button 
                  className="yes-button" 
                  type="button" 
                  onClick={async () => {
                    if (!connected) return setIsModalOpen(true);
                    try {
                      const win = window as any;
                      const provider = win.phantom?.solana || win.solana;
                      if (!provider) return alert("Please install Phantom to sign transactions.");
                      alert("Connecting to Flint Market Program (95ZEnzPdUE1bmF1oF2qjrYaGYPKyeeEmyz8h2xRgJ7e3)...");
                      // Mocks sending a transaction request to the provider
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  BUY YES
                </button>
                <button 
                  className="no-button" 
                  type="button" 
                  onClick={async () => {
                    if (!connected) return setIsModalOpen(true);
                    try {
                      const win = window as any;
                      const provider = win.phantom?.solana || win.solana;
                      if (!provider) return alert("Please install Phantom to sign transactions.");
                      alert("Connecting to Flint Market Program (95ZEnzPdUE1bmF1oF2qjrYaGYPKyeeEmyz8h2xRgJ7e3)...");
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  BUY NO
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="positions-panel"><div className="panel-title-row"><span className="metric-label">MY POSITIONS</span><BarChart3 size={15} /></div><div className="positions-total"><span className="metric-label">MARKED VALUE</span><strong className="mono">$1,078.00</strong><span className="mono position-profit">+194 USDC / +21.9%</span></div>{positions.map((position) => <div className="position-row" key={position.marketId}><div><span className="mono">{position.marketId} / {position.side}</span><strong className="mono">{position.stake}</strong></div><div className="position-return"><span className="mono">{position.returnValue}</span><small className="mono"><ArrowUpRight size={11} /> {position.move}</small></div></div>)}<div className="balance-ledger"><div><span>AVAILABLE</span><strong className="mono">{displayBalance}</strong></div><div><span>IN MARKETS</span><strong className="mono">0.00 SOL</strong></div><div><span>ESCROWED</span><strong className="mono">0.00 SOL</strong></div></div></aside>
      </div>
    </section>
  );
}
