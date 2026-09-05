import { ArrowUpRight, BarChart3, Radio, CheckCircle2, Loader2, ExternalLink, Plus, AlertCircle, TrendingUp, X } from "lucide-react";
import { useFlintWallet } from "@/contexts/WalletContext";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { useState, useEffect } from "react";
import { placeMarketOrderOnChain, fetchOnChainMarkets, fetchUserTraderPositions, createMarketOnChain } from "@/lib/flint-market-client";
import { PublicKey } from "@solana/web3.js";

export function PredictionMarket() {
  const { connected, balance, walletAddress, setIsModalOpen } = useFlintWallet();
  const displayBalance = balance !== null ? `${balance.toFixed(3)} SOL` : "0.00 SOL";

  const [marketList, setMarketList] = useState<any[]>([]);
  const [positionList, setPositionList] = useState<any[]>([]);
  const [loadingMarkets, setLoadingMarkets] = useState(true);
  const [tradingMarketId, setTradingMarketId] = useState<string | null>(null);
  const [tradeStatus, setTradeStatus] = useState<string | null>(null);
  const [lastTxUrl, setLastTxUrl] = useState<string | null>(null);

  // Create market modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newMarketGigId, setNewMarketGigId] = useState("");
  const [newMarketType, setNewMarketType] = useState<0 | 1 | 2>(0);
  const [creatingMarket, setCreatingMarket] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadData = async () => {
    setLoadingMarkets(true);
    try {
      const onChainMarkets = await fetchOnChainMarkets();
      setMarketList(onChainMarkets);

      if (connected && walletAddress) {
        const userPositions = await fetchUserTraderPositions(new PublicKey(walletAddress));
        setPositionList(userPositions);
      } else {
        setPositionList([]);
      }
    } catch (err) {
      console.warn("Error loading markets data:", err);
    } finally {
      setLoadingMarkets(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [connected, walletAddress]);

  const handleTrade = async (market: any, isYes: boolean) => {
    if (!connected || !walletAddress) return setIsModalOpen(true);

    try {
      setTradingMarketId(market.id);
      setTradeStatus(`Signing ${isYes ? "YES" : "NO"} order on Devnet...`);
      setLastTxUrl(null);

      const win = window as any;
      const provider = win.phantom?.solana || win.solflare || win.solana;
      if (!provider) throw new Error("No Solana browser wallet detected.");

      const rawId = parseInt(market.id, 10) || 1;
      const result = await placeMarketOrderOnChain(
        {
          marketId: rawId,
          isYes,
          amountSol: 0.01,
          traderPubkey: new PublicKey(walletAddress),
        },
        provider
      );

      setTradeStatus("Order confirmed on Devnet!");
      setLastTxUrl(result.explorerUrl);
      await loadData();
    } catch (err: any) {
      console.error("Trade error:", err);
      alert(`Trade failed: ${err?.message || "Transaction rejected"}`);
    } finally {
      setTradingMarketId(null);
    }
  };

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !walletAddress) return setIsModalOpen(true);

    const gigNum = parseInt(newMarketGigId.replace(/[^0-9]/g, ""), 10);
    if (!gigNum) {
      setCreateError("Please enter a valid numeric Gig ID (e.g. 499857 or 204).");
      return;
    }

    setCreatingMarket(true);
    setCreateError(null);

    try {
      const win = window as any;
      const provider = win.phantom?.solana || win.solflare || win.solana;
      if (!provider) throw new Error("No Solana browser wallet detected.");

      // Random unique market ID or gigId based
      const marketId = Math.floor(1000 + Math.random() * 9000);
      const targetTimestamp = Math.floor(Date.now() / 1000) + 7 * 86400; // 7 days from now

      const result = await createMarketOnChain(
        {
          marketId,
          gigId: gigNum,
          marketType: newMarketType,
          targetTimestamp,
          authority: new PublicKey(walletAddress),
        },
        provider
      );

      setLastTxUrl(result.explorerUrl);
      setIsCreateModalOpen(false);
      setNewMarketGigId("");
      await loadData();
    } catch (err: any) {
      console.error("Market creation failed:", err);
      setCreateError(err?.message || "Market deployment transaction failed.");
    } finally {
      setCreatingMarket(false);
    }
  };

  const totalCapitalSol = marketList.reduce((sum, m) => sum + (parseFloat(m.volume) || 0), 0);
  const totalUserStakeSol = positionList.reduce((sum, p) => sum + (parseFloat(p.stake) || 0), 0);

  return (
    <section className="workspace-section prediction-workspace" id="markets" aria-labelledby="market-title">
      <div className="workspace-heading">
        <div>
          <SectionLabel code="MKT / 002" tone="amber">Prediction Market</SectionLabel>
          <h2 id="market-title">Underwrite delivery risk.</h2>
          <p>Live on-chain order books on Solana Devnet. Trade YES or NO on worker reliability and milestone settlement before the deadline.</p>
        </div>
        <div className="market-balance-card">
          <span className="metric-label">TRADING BALANCE</span>
          <strong className="mono">{displayBalance}</strong>
          <button type="button" onClick={() => (connected ? setIsCreateModalOpen(true) : setIsModalOpen(true))}>
            {connected ? "OPEN MARKET" : "CONNECT WALLET"} <Plus size={13} />
          </button>
        </div>
      </div>

      <div className="market-overview-strip">
        <div><span className="metric-label">ACTIVE MARKETS</span><strong className="mono">{marketList.length}</strong></div>
        <div><span className="metric-label">CAPITAL IN BOOKS</span><strong className="mono">{totalCapitalSol.toFixed(2)} SOL</strong></div>
        <div><span className="metric-label">MY OPEN POSITIONS</span><strong className="mono">{positionList.length}</strong></div>
        <div><span className="metric-label">PROTOCOL RAKE</span><strong className="mono" style={{ color: "#FF6B00" }}>1.00% / TREASURY</strong></div>
        <div><span className="metric-label">ESCROW PROGRAM</span><strong className="mono market-good">DEVNET / LIVE</strong></div>
      </div>

      {lastTxUrl && (
        <div style={{ marginBottom: "16px", padding: "10px 14px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }} className="mono">
          <span style={{ color: "#10b981", fontSize: "0.8rem" }}>● Transaction confirmed on Solana Devnet!</span>
          <a href={lastTxUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#FF6B00", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px" }}>
            VIEW TRANSACTION <ExternalLink size={12} />
          </a>
        </div>
      )}

      <div className="prediction-layout">
        <div className="market-book">
          <div className="panel-title-row">
            <span className="metric-label">
              CURRENT BOOK {loadingMarkets && <Loader2 size={11} className="animate-spin inline ml-1 text-amber-500" />}
            </span>
            <span className="mono">SORT / LIQUIDITY</span>
          </div>

          {loadingMarkets ? (
            <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "rgba(255,255,255,0.5)" }} className="mono">
              <Loader2 size={24} className="animate-spin inline mr-2 text-amber-500" />
              <span>Querying Solana Devnet for active prediction markets...</span>
            </div>
          ) : marketList.length === 0 ? (
            <div
              style={{
                padding: "3.5rem 2rem",
                textAlign: "center",
                border: "1px dashed rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                margin: "1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <BarChart3 size={36} color="rgba(255, 255, 255, 0.2)" />
              <div style={{ maxWidth: "420px" }}>
                <h4 style={{ color: "#fff", fontSize: "1.05rem", margin: "0 0 6px" }}>0 Live Prediction Markets</h4>
                <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.82rem", lineHeight: "1.5", margin: 0 }}>
                  No prediction markets are currently active on Devnet. Underwriters can open a new market to price milestone completion for any live gig.
                </p>
              </div>
              <button
                type="button"
                className="amber-button mono"
                style={{ fontSize: "0.78rem", padding: "7px 14px", marginTop: "4px" }}
                onClick={() => (connected ? setIsCreateModalOpen(true) : setIsModalOpen(true))}
              >
                {connected ? "OPEN PREDICTION MARKET" : "CONNECT WALLET"} <Plus size={13} />
              </button>
            </div>
          ) : (
            marketList.map((market) => (
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
            ))
          )}
        </div>

        <aside className="positions-panel">
          <div className="panel-title-row">
            <span className="metric-label">MY POSITIONS</span>
            <BarChart3 size={15} />
          </div>

          <div className="positions-total">
            <span className="metric-label">TOTAL STAKED</span>
            <strong className="mono">{totalUserStakeSol.toFixed(3)} SOL</strong>
            <span className="mono position-profit">
              {positionList.length > 0 ? `${positionList.length} ACTIVE CONTRACTS` : "NO POSITIONS"}
            </span>
          </div>

          {positionList.length === 0 ? (
            <div style={{ padding: "2rem 1rem", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }} className="mono">
              No open positions. Trade YES or NO on a market to underwrite delivery risk.
            </div>
          ) : (
            positionList.map((position, idx) => (
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
            ))
          )}

          <div className="balance-ledger">
            <div><span>AVAILABLE</span><strong className="mono">{displayBalance}</strong></div>
            <div><span>TOTAL IN MARKETS</span><strong className="mono">{totalUserStakeSol.toFixed(3)} SOL</strong></div>
            <div><span>PROTOCOL RAKE</span><strong className="mono" style={{ color: "#FF6B00" }}>1.00% ON CLAIMS</strong></div>
            <div><span>NETWORK</span><strong className="mono">SOLANA DEVNET</strong></div>
          </div>
        </aside>
      </div>

      {/* Create Market Modal */}
      {isCreateModalOpen && (
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
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "#0a0c10",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "12px",
              padding: "1.5rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Plus size={18} color="#FF6B00" />
                <h3 style={{ color: "#fff", margin: 0, fontSize: "1.1rem" }}>Initialize Prediction Market</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateMarket} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="mono" style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "4px" }}>
                  TARGET GIG ID (ESCROW)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 499857 or 204"
                  value={newMarketGigId}
                  onChange={(e) => setNewMarketGigId(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", color: "#fff", fontFamily: "monospace" }}
                  required
                />
              </div>

              <div>
                <label className="mono" style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "4px" }}>
                  MARKET RISK TYPE
                </label>
                <select
                  value={newMarketType}
                  onChange={(e) => setNewMarketType(Number(e.target.value) as 0 | 1 | 2)}
                  style={{ width: "100%", padding: "8px 12px", background: "#0a0c10", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", color: "#fff", fontFamily: "monospace" }}
                >
                  <option value={0}>VELOCITY / TIME (Will deliver on time?)</option>
                  <option value={1}>QUALITY BENCHMARK (Will pass criteria?)</option>
                  <option value={2}>RACE / CONTEST (First valid delivery?)</option>
                </select>
              </div>

              {createError && (
                <div style={{ color: "#ef4444", fontSize: "0.75rem" }} className="mono">
                  {createError}
                </div>
              )}

              <button
                type="submit"
                disabled={creatingMarket}
                className="amber-button mono"
                style={{ width: "100%", padding: "10px", marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                {creatingMarket ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {creatingMarket ? "DEPLOYING TO DEVNET..." : "DEPLOY ON-CHAIN MARKET"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
