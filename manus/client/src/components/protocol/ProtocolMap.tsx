// Black Ledger style reminder: this map is a left-to-right protocol instrument—clear lanes, straight routes, one central FLINT settlement mark, and no decorative node cloud.

export function ProtocolMap() {
  return (
    <div className="protocol-map" role="img" aria-label="Protocol flow from human request through FLINT settlement and prediction layer to two autonomous agents">
      <div className="map-status-row mono">
        <span><i className="map-live-dot" /> PROTOCOL FLOW / LIVE</span>
        <span>EPOCH 118</span>
      </div>
      <svg className="protocol-map-svg" viewBox="0 0 680 300" aria-hidden="true">
        <defs>
          <marker id="arrow-steel" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#777777" /></marker>
          <marker id="arrow-amber" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#FF6B00" /></marker>
          <marker id="arrow-emerald" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#10B981" /></marker>
        </defs>

        <g className="map-prediction-frame">
          <rect x="260" y="44" width="190" height="190" transform="rotate(14 355 139)" />
          <text x="356" y="272" textAnchor="middle">PREDICTION LAYER</text>
        </g>

        <path className="map-route map-route-human" d="M58 139 H284" markerEnd="url(#arrow-steel)" />
        <path className="map-route map-route-amber" d="M396 139 H603" markerEnd="url(#arrow-amber)" />
        <path className="map-route map-route-emerald" d="M603 139 V222" markerEnd="url(#arrow-emerald)" />

        <g className="map-endpoint map-human" transform="translate(32 120)">
          <rect width="52" height="38" />
          <text x="26" y="16" textAnchor="middle">HUMAN</text>
          <text x="26" y="29" textAnchor="middle" className="map-endpoint-sub">REQUEST</text>
        </g>

        <g className="map-flint" transform="translate(284 104)">
          <rect width="112" height="70" />
          <rect x="12" y="12" width="88" height="46" className="map-flint-inner" />
          <circle cx="56" cy="35" r="7" />
          <text x="56" y="40" textAnchor="middle">FLINT</text>
        </g>

        <g className="map-endpoint map-agent-a" transform="translate(590 120)">
          <rect width="72" height="38" />
          <text x="36" y="16" textAnchor="middle">AGENT A</text>
          <text x="36" y="29" textAnchor="middle" className="map-endpoint-sub">SCOUT</text>
        </g>
        <g className="map-endpoint map-agent-b" transform="translate(590 222)">
          <rect width="72" height="38" />
          <text x="36" y="16" textAnchor="middle">AGENT B</text>
          <text x="36" y="29" textAnchor="middle" className="map-endpoint-sub">ARBITER</text>
        </g>

        <text className="map-route-label map-route-label-left" x="134" y="130">REQUEST / SIGNED</text>
        <text className="map-route-label map-route-label-right" x="482" y="130">DELIVERY / ESCROW</text>
      </svg>
      <div className="map-legend mono">
        <span><i className="legend-swatch legend-swatch-human" /> HUMAN REQUEST</span>
        <span><i className="legend-swatch legend-swatch-agent" /> AGENT EXECUTION</span>
        <span><i className="legend-swatch legend-swatch-prediction" /> PREDICTION UNDERWRITING</span>
      </div>
    </div>
  );
}
