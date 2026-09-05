// Black Ledger style reminder: keep domain labels explicit, values tabular, and accent colors semantic.

export type MarketStatus = "Open" | "Closing" | "Settled";

export type GigCategory = "ENGINEERING" | "DESIGN" | "RESEARCH" | "AI & DATA" | "OPERATIONS";
export type DeliverableType = "Figma / Design URL" | "Research Doc / Whitepaper" | "Code / Repository PR" | "AI Dataset / Weights" | "Deployment Receipt";

export type Gig = {
  id: string;
  title: string;
  category: GigCategory;
  lane: "Human → Agent" | "Agent → Agent" | "Human → Human";
  budget: string;
  deadline: string;
  submissions: number;
  verification: string;
  status: "Accepting" | "Reviewing" | "Funded";
  deliverableType?: DeliverableType;
  deliverableUrl?: string;
  deliverableNotes?: string;
  deliverableHash?: string;
  description?: string;
  acceptanceCriteria?: string;
  client?: string;
  freelancer?: string;
  pda?: string;
  vault?: string;
};

export type Position = {
  marketId: string;
  side: "YES" | "NO";
  stake: string;
  returnValue: string;
  move: string;
};

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

export const gigs: Gig[] = [];

export const positions: Position[] = [];

export const markets: Market[] = [];

export const telemetry: TelemetryMetric[] = [];

export const agentActivity: AgentActivity[] = [];

export type SoulboundToken = {
  mint: string;
  name: string;
  category: GigCategory;
  earnedDate: string;
  gigId: string;
  amountSol: number;
  onTime: boolean;
  score: number;
  txSignature: string;
};

export type BuilderPassportData = {
  address: string;
  handle: string;
  builderScore: number;
  completedGigs: number;
  onTimeRate: number;
  totalEarnedSol: number;
  disputeWinRate: number;
  skills: { name: string; level: number; category: GigCategory }[];
  soulboundTokens: SoulboundToken[];
  telemetryChecks: { label: string; value: string; status: "verified" | "watch" }[];
};

export const createEmptyPassport = (address?: string): BuilderPassportData => ({
  address: address || "",
  handle: address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "unconnected",
  builderScore: 0,
  completedGigs: 0,
  onTimeRate: 100,
  totalEarnedSol: 0,
  disputeWinRate: 100,
  skills: [
    { name: "Engineering / Rust", level: 0, category: "ENGINEERING" },
    { name: "Design & UX", level: 0, category: "DESIGN" },
    { name: "Research & Modeling", level: 0, category: "RESEARCH" },
    { name: "AI & Data Evals", level: 0, category: "AI & DATA" },
    { name: "Operations & DevOps", level: 0, category: "OPERATIONS" },
  ],
  soulboundTokens: [],
  telemetryChecks: [
    { label: "SOLANA WALLET AGE", value: "ANALYZING RPC", status: "watch" },
    { label: "DEVNET TX VOLUME", value: "0 TXS", status: "watch" },
    { label: "SYBIL RESISTANCE", value: "PENDING DEPOSIT", status: "watch" },
    { label: "DISPUTE RECORD", value: "0 DISPUTES", status: "verified" },
  ],
});

export const defaultPassport: BuilderPassportData = createEmptyPassport();

export const navItems = [
  { label: "Gig Exchange", href: "/exchange" },
  { label: "Prediction Market", href: "/markets" },
  { label: "Builder Passport", href: "/passport" },
  { label: "Verification", href: "/#telemetry" },
  { label: "Protocol", href: "/#protocol" },
];
