// Black Ledger style reminder: market cards read like exchange tickets—values align, statuses stay semantic, and borders do the work.

import { ArrowUpRight, Clock3, TrendingDown, TrendingUp } from "lucide-react";
import type { Market } from "@/lib/flint-data";

type MarketCardProps = {
  market: Market;
  featured?: boolean;
};

function ActivityTrace({ points }: { points: number[] }) {
  const width = 138;
  const height = 38;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((point - min) / range) * 27 - 4;
    return `${x},${y}`;
  });

  return (
    <svg className="activity-trace" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Market activity trace">
      <path d={`M ${coords.join(" L ")}`} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <circle cx={coords[coords.length - 1].split(",")[0]} cy={coords[coords.length - 1].split(",")[1]} r="2.5" fill="currentColor" />
    </svg>
  );
}

export function MarketCard({ market, featured = false }: MarketCardProps) {
  const positive = market.changeTone === "positive";

  return (
    <article className={`market-card ${featured ? "market-card-featured" : ""}`}>
      <div className="market-card-topline">
        <span className="mono market-id">MKT-{market.id}</span>
        <span className={`market-status market-status-${market.status.toLowerCase()}`}>
          <span className="status-dot" />
          {market.status}
        </span>
      </div>

      <div className="market-card-heading">
        <div>
          <p className="eyebrow">{market.category}</p>
          <h3>{market.title}</h3>
        </div>
        <span className="market-arrow" aria-hidden="true"><ArrowUpRight size={16} /></span>
      </div>

      <div className="market-odds-row">
        <div>
          <p className="metric-label">IMPLIED PROBABILITY</p>
          <p className="metric-value metric-value-large">{market.probability}<span>%</span></p>
        </div>
        <div className={`market-change ${positive ? "market-change-positive" : ""}`}>
          {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span className="mono">{market.change}</span>
        </div>
        <div className={`activity-wrap ${positive ? "activity-positive" : ""}`}>
          <p className="metric-label">7D ACTIVITY</p>
          <ActivityTrace points={market.activity} />
        </div>
      </div>

      <div className="market-card-footer">
        <div className="market-detail">
          <span className="metric-label">LIQUIDITY</span>
          <span className="mono">{market.volume} SOL</span>
        </div>
        <div className="market-detail market-detail-right">
          <Clock3 size={13} />
          <span className="mono">{market.expiry}</span>
        </div>
      </div>

      <div className="market-tags">
        {market.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
    </article>
  );
}
