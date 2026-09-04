// Black Ledger style reminder: keep domain labels explicit, values tabular, and accent colors semantic.

export type MarketStatus = "Open" | "Closing" | "Settled";

export type Market = {
  id: string;
  title: string;
  category: string;
  status: MarketStatus;
  probability: number;
  volume: string;
  expiry: string;
  change: string;
  changeTone: "positive" | "neutral";
  tags: string[];
  activity: number[];
};

export type TelemetryMetric = {
  label: string;
  source: string;
  value: string;
  detail: string;
  status: "verified" | "watch" | "live";
  width: number;
};

export type AgentActivity = {
  time: string;
  agent: string;
  action: string;
  tone: "amber" | "emerald" | "neutral";
};

export const markets: Market[] = [
  {
    id: "004",
    title: "Open-source bounty: Rust async runtime",
    category: "SOFTWARE / RUST",
    status: "Open",
    probability: 68,
    volume: "18,420.00",
    expiry: "06H 42M",
    change: "+4.8%",
    changeTone: "positive",
    tags: ["GITHUB VERIFIED", "MAGICBLOCK"],
    activity: [34, 42, 38, 52, 48, 66, 61, 68, 74, 68, 78, 82],
  },
  {
    id: "007",
    title: "Zero-knowledge audit: bridge relayer",
    category: "SECURITY / ZK",
    status: "Closing",
    probability: 42,
    volume: "9,875.50",
    expiry: "01D 03H",
    change: "-1.2%",
    changeTone: "neutral",
    tags: ["THRESHOLD 2/3", "EPOCH 118"],
    activity: [62, 56, 64, 58, 54, 50, 48, 46, 44, 42, 45, 42],
  },
  {
    id: "011",
    title: "Design system migration: 12 surfaces",
    category: "PRODUCT / SYSTEMS",
    status: "Open",
    probability: 81,
    volume: "6,220.00",
    expiry: "02D 11H",
    change: "+8.1%",
    changeTone: "positive",
    tags: ["WALLET AGE > 90D", "ESCROWED"],
    activity: [28, 36, 34, 45, 44, 52, 60, 58, 65, 70, 76, 81],
  },
];

export const telemetry: TelemetryMetric[] = [
  { label: "WALLET AGE", source: "SOLANA RPC", value: "2Y 144D", detail: "min. threshold 90D", status: "verified", width: 92 },
  { label: "GITHUB VELOCITY", source: "GITHUB API", value: "94 / 100", detail: "last 30 day window", status: "verified", width: 94 },
  { label: "IDENTITY ATTESTATION", source: "LINKEDIN", value: "VERIFIED", detail: "proof refreshed 12m ago", status: "verified", width: 100 },
  { label: "DELIVERY HISTORY", source: "FLINT INDEXER", value: "17 / 19", detail: "89.4% settled on time", status: "watch", width: 89 },
];

export const agentActivity: AgentActivity[] = [
  { time: "14:38:11", agent: "SCOUT-7A", action: "countered ask on MKT-004", tone: "amber" },
  { time: "14:37:49", agent: "ARBITER-02", action: "confirmed epoch 118 quorum", tone: "emerald" },
  { time: "14:36:20", agent: "SCOUT-3C", action: "opened market MKT-011", tone: "amber" },
  { time: "14:34:08", agent: "INDEXER-01", action: "synced github commit set", tone: "neutral" },
  { time: "14:32:41", agent: "ARBITER-02", action: "released escrow tranche 01", tone: "emerald" },
];

export const navItems = [
  { label: "Markets", href: "#markets" },
  { label: "Agents", href: "#agents" },
  { label: "Telemetry", href: "#telemetry" },
  { label: "Protocol", href: "#protocol" },
];
