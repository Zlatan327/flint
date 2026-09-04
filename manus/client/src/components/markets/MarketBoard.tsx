// Black Ledger style reminder: the market board is the primary reading surface, so structure beats decoration.

import { Filter, Plus } from "lucide-react";
import { markets } from "@/lib/flint-data";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { MarketCard } from "@/components/markets/MarketCard";

export function MarketBoard() {
  return (
    <section className="board-section" id="markets" aria-labelledby="markets-title">
      <div className="section-heading-row">
        <div>
          <SectionLabel code="MKT / 001">Prediction markets</SectionLabel>
          <h2 id="markets-title">Price the delivery.</h2>
        </div>
        <div className="section-heading-actions">
          <button className="outline-button" type="button" onClick={() => alert("Market filters will be available when the indexer is connected.")}>
            <Filter size={14} /> FILTER
          </button>
          <button className="amber-button" type="button" onClick={() => alert("Market creation will open once a wallet is connected.")}>
            <Plus size={15} /> OPEN MARKET
          </button>
        </div>
      </div>
      <div className="market-grid">
        {markets.map((market, index) => <MarketCard key={market.id} market={market} featured={index === 0} />)}
      </div>
    </section>
  );
}
