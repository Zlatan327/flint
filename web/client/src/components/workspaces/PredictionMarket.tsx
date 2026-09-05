// Black Ledger style reminder: the Prediction Market makes risk legible—current books, wallet balance, open positions, and settlement context before any action.

import { ArrowUpRight, BarChart3, Radio, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { markets, positions } from "@/lib/flint-data";
import { useFlintWallet } from "@/contexts/WalletContext";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { useState } from "react";
import { placeMarketOrderOnChain } from "@/lib/flint-market-client";
import { PublicKey } from "@solana/web3.js";

export function PredictionMarket() {
  const { connected, balance, walletAddress, setIsModalOpen } = useFlintWallet();
  const displayBalance = balance !== null ? `${balance.toFixed(3)} SOL` : "0.00 SOL";
  const [positionList, setPositionList] = useState(positions);
  const [tradingMarketId, setTradingMarketId] = useState<string | null>(null);
  const [tradeStatus, setTradeStatus] = useState<string | null>(null);
  const [lastTxUrl, setLastTxUrl] = useState<string | null>(null);

  const handleTrade = async (market: any, isYes: boolean) => {
    if (!connected || !walletAddress) return setIsModalOpen(true);

    try {
      setTradingMarketId(market.id);
      setTradeStatus(`Signing ${isYes ? "YES" : "NO"} order on Devnet...`);
      setLastTxUrl(null);

      const win = window as any;
      const provider = win.phantom?.solana || win.solflare || win.solana;
      if (!provider) throw new Error("No Solana browser wallet detected.");

      const result = await placeMarketOrderOnChain(
        {
          marketId: parseInt(market.id, 10) || 4,
          isYes,
          amountSol: 0.01,
          traderPubkey: new PublicKey(walletAddress),
        },
        provider
      );

      setTradeStatus("Order confirmed on Devnet!");
      setLastTxUrl(result.explorerUrl);

      // Add position locally
      const newPos = {
        marketId: `MKT-${market.id}`,
        side: (isYes ? "YES" : "NO") as "YES" | "NO",
        stake: "0.01 SOL",
        returnValue: "+0.018 SOL",
        move: "+5.2%",
      };
      setPositionList((prev) => [newPos, ...prev]);
    } catch (err: any) {
      console.error("Trade error:", err);
      alert(`Trade failed: ${err?.message || "Transaction rejected"}`);
    } finally {
      setTradingMarketId(null);
    }
  };

  return (
    <section className="workspace-section prediction-workspace" id="markets" aria-labelledby="market-title">
      <div className="workspace-heading">
        <div>
          <SectionLabel code="MKT / 002" tone="amber">Prediction Market</SectionLabel>
          <h2 id="market-title">Underwrite delivery risk.</h2>
          <p>Order book priced on gig completion. Trade YES or NO on worker reliability and milestone settlement before the deadline.</p>
        </div>
        <div className="market-balance-card">
          <span className="metric-label">TRADING BALANCE</span>
          <strong className="mono">{displayBalance}</strong>
          <button type="button" onClick={() => !connected && setIsModalOpen(true)}>
            {connected ? "ACTIVE DEPOSIT" : "CONNECT WALLET"} <Radio size={13} />
          </button>
        </div>
      </div>

      <div className="market-overview-strip">
        <div><span className="metric-label">OPEN MARKETS</span><strong className="mono">24</strong></div>
        <div><span className="metric-label">CAPITAL IN BOOKS</span><strong className="mono">412 SOL</strong></div>
        <div><span className="metric-label">MY OPEN BETS</span><strong className="mono">0.02 SOL</strong></div>
        <div><span className="metric-label">SETTLEMENT RATE</span><strong className="mono market-good">89.4%</strong></div>
      </div>

      {lastTxUrl && (
        <div style={{ marginBottom: "16px", padding: "10px 14px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }} className="mono">
          <span style={{ color: "#10b981", fontSize: "0.8rem" }}>● Order executed on Solana Devnet!</span>
          <a href={lastTxUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#FF6B00", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px" }}>
            VIEW TRANSACTION <ExternalLink size={12} />
          </a>
        </div>
      )}

      <div className="prediction-layout">
        <div className="market-book">
          <div className="panel-title-row"><span className="metric-label">CURRENT BOOK</span><span className="mono">SORT / LIQUIDITY</span></div>
          {markets.map((market) => (
            <article className="market-book-row" key={market.id}>
              <div className="market-book-main">
                <span className="mono market-book-id">MKT-{market.id}</span>
                <h3>{market.title}</h3>
                <span className="mono market-book-meta">{market.category} · CLOSES {market.expiry}</span>
              </div>
              <div className="market-book-prob">
                <span className="metric-label">YES</span>
                <strong className="mono">{market.probability}%</strong>
                <span className="market-trend"><ArrowUpRight size={12} /> {market.change}</span>
              </div>
              <div className="market-book-actions">
                <button 
                  className="yes-button" 
                  type="button" 
                  disabled={tradingMarketId === market.id}
                  onClick={() => handleTrade(market, true)}
                >
                  {tradingMarketId === market.id ? <Loader2 size={12} className="animate-spin" /> : "BUY YES (0.01 SOL)"}
                </button>
                <button 
                  className="no-button" 
                  type="button" 
                  disabled={tradingMarketId === market.id}
                  onClick={() => handleTrade(market, false)}
                >
                  {tradingMarketId === market.id ? <Loader2 size={12} className="animate-spin" /> : "BUY NO (0.01 SOL)"}
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="positions-panel">
          <div className="panel-title-row">
            <span className="metric-label">MY POSITIONS</span>
            <BarChart3 size={15} />
          </div>
          <div className="positions-total">
            <span className="metric-label">MARKED VALUE</span>
            <strong className="mono">0.038 SOL</strong>
            <span className="mono position-profit">+0.018 SOL / +21.9%</span>
          </div>
          {positionList.map((position, idx) => (
            <div className="position-row" key={`${position.marketId}-${idx}`}>
              <div>
                <span className="mono">{position.marketId} / {position.side}</span>
                <strong className="mono">{position.stake}</strong>
              </div>
              <div className="position-return">
                <span className="mono">{position.returnValue}</span>
                <small className="mono"><ArrowUpRight size={11} /> {position.move}</small>
              </div>
            </div>
          ))}
          <div className="balance-ledger">
            <div><span>AVAILABLE</span><strong className="mono">{displayBalance}</strong></div>
            <div><span>IN MARKETS</span><strong className="mono">0.02 SOL</strong></div>
            <div><span>ESCROWED</span><strong className="mono">0.01 SOL</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}
