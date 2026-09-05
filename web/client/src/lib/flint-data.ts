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

export const gigs: Gig[] = [
  {
    id: "GIG-204",
    title: "Rust async benchmark suite for Ephemeral Rollup",
    category: "ENGINEERING",
    lane: "Human → Agent",
    budget: "3.20 SOL",
    deadline: "06H 42M",
    submissions: 12,
    verification: "GITHUB + WALLET",
    status: "Accepting",
    deliverableType: "Code / Repository PR",
    description: "Write criterion.rs microbenchmarks measuring end-to-end latency for MagicBlock Ephemeral Rollup state transitions on Solana Devnet.",
    acceptanceCriteria: "Passes 10,000 TPS burst simulation with sub-15ms roundtrip confirmations and full unit test coverage.",
  },
  {
    id: "GIG-219",
    title: "Figma design system migration / 12 protocol surfaces",
    category: "DESIGN",
    lane: "Human → Human",
    budget: "4.50 SOL",
    deadline: "01D 03H",
    submissions: 7,
    verification: "FIGMA + SBT",
    status: "Reviewing",
    deliverableType: "Figma / Design URL",
    deliverableUrl: "https://www.figma.com/file/FlintDesignSystemV2",
    deliverableNotes: "Complete tokenized typography, high-contrast Black Ledger theme rules, and 12 responsive surface components in auto-layout.",
    deliverableHash: "8f2a1b9c4d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
    description: "Refactor core UI design system into auto-layout components adhering strictly to the Black Ledger aesthetic.",
    acceptanceCriteria: "100% tokenized color palette, responsive desktop/mobile variants, and interactive component state documentation.",
  },
  {
    id: "GIG-225",
    title: "Solana Agent Economy Tokenomics & Risk Simulation",
    category: "RESEARCH",
    lane: "Agent → Agent",
    budget: "5.80 SOL",
    deadline: "02D 18H",
    submissions: 4,
    verification: "NOTION + ORACLE",
    status: "Accepting",
    deliverableType: "Research Doc / Whitepaper",
    description: "Mathematical modeling and bonding curve simulation analyzing underwriter capital efficiency in Flint delivery prediction markets.",
    acceptanceCriteria: "Includes Python/Jupyter simulation notebook, Monte Carlo stress testing under 40% default rate, and executive summary.",
  },
  {
    id: "GIG-231",
    title: "RLHF Evaluation Dataset: 1,000 Solana Dev Prompts",
    category: "AI & DATA",
    lane: "Human → Agent",
    budget: "6.20 SOL",
    deadline: "02D 11H",
    submissions: 19,
    verification: "HUGGINGFACE + PROOF",
    status: "Reviewing",
    deliverableType: "AI Dataset / Weights",
    deliverableUrl: "https://huggingface.co/datasets/flint-labs/solana-agent-evals",
    deliverableNotes: "Validated 1,000 multi-turn pair completions with Anchor 0.30 syntax correctness scores and security annotations.",
    deliverableHash: "4c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d",
    description: "Curate and annotate 1,000 pairwise human feedback samples evaluating Anchor smart contract code generation quality.",
    acceptanceCriteria: "Inter-annotator agreement > 0.85, JSONL schema validation, and verified zero-hallucination Anchor macro usage.",
  },
  {
    id: "GIG-242",
    title: "Developer Documentation Localization & Deployment",
    category: "OPERATIONS",
    lane: "Human → Human",
    budget: "2.40 SOL",
    deadline: "03D 06H",
    submissions: 3,
    verification: "DEPLOYMENT + PR",
    status: "Funded",
    deliverableType: "Deployment Receipt",
    description: "Translate full Flint developer docs into Japanese & Korean and configure multilingual deployment on staging.",
    acceptanceCriteria: "Accurate technical terminology, verified testnet links, and live staging deploy receipt.",
  },
];

export const positions: Position[] = [
  { marketId: "MKT-004", side: "YES", stake: "0.42 SOL", returnValue: "+0.12 SOL", move: "+4.8%" },
  { marketId: "MKT-007", side: "NO", stake: "0.18 SOL", returnValue: "+0.08 SOL", move: "+1.2%" },
];

export const walletBalance = { available: "12.84 SOL", inMarkets: "0.60 SOL", escrowed: "3.20 SOL" };

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

export const defaultPassport: BuilderPassportData = {
  address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  handle: "operator-04.sol",
  builderScore: 96,
  completedGigs: 28,
  onTimeRate: 96.4,
  totalEarnedSol: 142.85,
  disputeWinRate: 100,
  skills: [
    { name: "Anchor / Solana", level: 98, category: "ENGINEERING" },
    { name: "Design Systems / Tokens", level: 92, category: "DESIGN" },
    { name: "Risk & Tokenomics", level: 88, category: "RESEARCH" },
    { name: "RLHF / Prompt Evals", level: 90, category: "AI & DATA" },
    { name: "DevOps & Rollups", level: 94, category: "OPERATIONS" },
  ],
  soulboundTokens: [
    {
      mint: "SBT-ENG-2049",
      name: "Rust Async Runtime Architect",
      category: "ENGINEERING",
      earnedDate: "2026-08-28",
      gigId: "GIG-188",
      amountSol: 12.5,
      onTime: true,
      score: 99,
      txSignature: "3MvK...9fLx",
    },
    {
      mint: "SBT-DSN-1082",
      name: "Black Ledger UI Master",
      category: "DESIGN",
      earnedDate: "2026-08-15",
      gigId: "GIG-172",
      amountSol: 8.0,
      onTime: true,
      score: 97,
      txSignature: "5WqZ...2eRt",
    },
    {
      mint: "SBT-AI-0419",
      name: "Solana Evals Specialist",
      category: "AI & DATA",
      earnedDate: "2026-07-30",
      gigId: "GIG-145",
      amountSol: 14.2,
      onTime: true,
      score: 95,
      txSignature: "8LpP...4vBn",
    },
  ],
  telemetryChecks: [
    { label: "SOLANA WALLET AGE", value: "2Y 144D", status: "verified" },
    { label: "GITHUB CODE COMMITS", value: "94 / 100", status: "verified" },
    { label: "SYBIL RESISTANCE", value: "PASSED (SCORE 98)", status: "verified" },
    { label: "DISPUTE RECORD", value: "0 PENALTIES / 28 SETTLED", status: "verified" },
  ],
};

export const navItems = [
  { label: "Gig Exchange", href: "/exchange" },
  { label: "Prediction Market", href: "/markets" },
  { label: "Builder Passport", href: "/passport" },
  { label: "Verification", href: "/#telemetry" },
  { label: "Protocol", href: "/#protocol" },
];
