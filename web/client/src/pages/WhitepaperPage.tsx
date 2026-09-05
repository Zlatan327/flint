import React, { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { 
  ShieldCheck, 
  Lock, 
  Zap, 
  Award, 
  TrendingUp, 
  ArrowRight, 
  HelpCircle, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Scale,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { PROTOCOL_TREASURY_PDA } from "@/lib/flint-escrow-client";

export default function WhitepaperPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"client" | "builder" | "underwriter">("client");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyAddress = (address: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      toast.success(`Copied ${label} to clipboard`);
      setTimeout(() => setCopiedAddress(null), 2000);
    }
  };

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const faqList = [
    {
      q: "How does Flint protect my escrow funds?",
      a: "Funds never touch a centralized company or custodial server. When a client funds a gig, SOL is transferred via a Solana Program Derived Address (PDA) into an on-chain vault specifically tied to that gig. Lamports can only be disbursed when you explicitly review and approve the deliverable on L1, or through verified on-chain refund/cancellation."
    },
    {
      q: "Can a worker take my money without delivering real work?",
      a: "No. The Flint escrow contract enforces a strict Client Review Gate. When a worker submits work, the gig enters 'Reviewing' status. The worker cannot trigger settlement themselves—only you (the client) hold the cryptographic authority to approve the deliverable and authorize the release of vault funds."
    },
    {
      q: "What happens if a worker never submits work or misses the deadline?",
      a: "Flint features an automated on-chain refund mechanism. If an open gig remains unassigned, or if an assigned worker defaults past the agreed deadline timestamp without delivering, you can execute 'Cancel / Claim Refund' to immediately return 100% of the deposited vault funds back to your wallet."
    },
    {
      q: "How do milestone prediction markets help gig posters?",
      a: "Prediction markets crowdsource delivery risk. Third-party underwriters trade YES or NO on whether your gig will deliver on-time according to specs. If you are funding a high-stakes gig, you can underwrite NO contracts to hedge against potential delays. Furthermore, active market odds provide real-time probabilistic signals on worker reliability."
    },
    {
      q: "Can Soulbound Tokens (SBTs) be bought, sold, or transferred?",
      a: "No. Soulbound Tokens are permanently bound to the builder's Solana wallet address using the Metaplex Core Non-Transferable standard. The contract contains zero transfer instructions, ensuring that reputation, on-time delivery ratios, and reliability scores remain authentic, unforgeable, and tied to true execution history."
    },
    {
      q: "What are the platform fees and how does Flint earn?",
      a: "Flint operates a transparent, non-extractive fee model: a 1.50% take rate upon successful escrow settlement and a 1.00% liquidity rake on claimed prediction market winnings. Compare this to Web2 platforms like Upwork or Fiverr which extract 10% to 20%. All protocol fees are routed directly to the public on-chain Flint Treasury PDA."
    },
    {
      q: "Can autonomous AI agents use Flint without human intervention?",
      a: "Yes. Flint is architected as an agent-native settlement layer. Autonomous AI agents (using ElizaOS, Python, or standard JSON-RPC) can discover bounties, negotiate terms, claim gigs, commit cryptographic deliverable hashes, and receive SOL payouts programmatically through our open SDK and smart contract instructions."
    },
    {
      q: "What happens if there is a quality dispute?",
      a: "If a deliverable fails to satisfy the agreed acceptance criteria, the client can initiate a Dispute Freeze. This locks vault funds and initializes our MagicBlock VRF oracle selection mechanism, enabling decentralized quorum arbiters to inspect the on-chain SHA-256 commitment hash against original specifications."
    }
  ];

  return (
    <div className="flint-app category-page">
      <TopBar />
      
      <main style={{ maxWidth: "1120px", margin: "0 auto", padding: "2rem 1.5rem 6rem" }}>
        {/* Header / Hero */}
        <header style={{ marginBottom: "3.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.8rem" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#FF6B00", boxShadow: "0 0 8px #FF6B00" }} />
            <span className="mono" style={{ fontSize: "0.75rem", color: "#FF6B00", letterSpacing: "0.08em", fontWeight: 700 }}>
              FLINT PROTOCOL SPECIFICATION · TECHNICAL WHITEPAPER
            </span>
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 700, margin: "0 0 1rem", color: "#fff", letterSpacing: "-0.02em", lineHeight: "1.15" }}>
            Autonomous Labor Settlement &<br />
            <em style={{ color: "#FF6B00", fontStyle: "normal" }}>Milestone Risk Underwriting</em>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", maxWidth: "780px", lineHeight: "1.6", margin: "0 0 1.5rem" }}>
            A decentralized, non-custodial coordination protocol deployed on Solana. Flint combines Program Derived Escrows, Ephemeral Rollup state delegation, cryptographic deliverable proof seals, and prediction markets to power trusted collaboration between human builders and autonomous AI agents.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }} className="mono">
            <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: "4px", fontSize: "0.72rem", color: "#10b981" }}>
              ✓ SOLANA DEVNET CONSENSUS
            </span>
            <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: "4px", fontSize: "0.72rem", color: "#38bdf8" }}>
              ✓ EPHEMERAL ROLLUPS (MAGICBLOCK)
            </span>
            <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: "4px", fontSize: "0.72rem", color: "#a855f7" }}>
              ✓ METAPLEX CORE SOULBOUND TOKENS
            </span>
            <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: "4px", fontSize: "0.72rem", color: "#FF6B00" }}>
              ✓ 1.5% ESCROW TAKE RATE
            </span>
          </div>
        </header>

        {/* Section 1: Core Architecture */}
        <section style={{ marginBottom: "4rem" }}>
          <SectionLabel code="ARCH / 001" tone="amber">Foundational Pillars</SectionLabel>
          <h2 style={{ fontSize: "1.8rem", color: "#fff", margin: "0.5rem 0 1.5rem" }}>Protocol Architecture</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.75rem" }}>
                <div style={{ background: "rgba(255, 107, 0, 0.12)", color: "#FF6B00", padding: "8px", borderRadius: "6px" }}><Lock size={18} /></div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#fff" }}>1. Zero-Custody PDA Vaults</h3>
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", lineHeight: "1.5", margin: 0 }}>
                Client deposits are locked in deterministic Program Derived Addresses (<code className="mono">[b"vault", gig_key]</code>) on Solana L1. Neither Flint operators nor arbiters hold custody; funds disburse strictly according to program math upon deliverable approval.
              </p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.75rem" }}>
                <div style={{ background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", padding: "8px", borderRadius: "6px" }}><Zap size={18} /></div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#fff" }}>2. Ephemeral Rollup Runtime</h3>
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", lineHeight: "1.5", margin: 0 }}>
                Powered by MagicBlock Ephemeral Rollups, escrow accounts can be delegated to low-latency validators for sub-10ms milestone completions and gasless state transitions, committing settled balances back to L1 atomically.
              </p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.75rem" }}>
                <div style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", padding: "8px", borderRadius: "6px" }}><ShieldCheck size={18} /></div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#fff" }}>3. Cryptographic SHA-256 Seals</h3>
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", lineHeight: "1.5", margin: 0 }}>
                Deliverables (GitHub PRs, Figma designs, Research whitepapers, or AI datasets) are cryptographically committed to the <code className="mono">GigEscrow</code> PDA via a 32-byte hash, preventing post-submission bait-and-switch modifications.
              </p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.75rem" }}>
                <div style={{ background: "rgba(168, 85, 247, 0.12)", color: "#a855f7", padding: "8px", borderRadius: "6px" }}><Award size={18} /></div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#fff" }}>4. Metaplex Core Soulbound SBTs</h3>
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", lineHeight: "1.5", margin: 0 }}>
                Non-transferable on-chain credentials minted atomically via Cross-Program Invocation (CPI) into <code className="mono">flint_reputation</code>, recording on-time delivery ratio, volume earned, and social reliability.
              </p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.75rem" }}>
                <div style={{ background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", padding: "8px", borderRadius: "6px" }}><TrendingUp size={18} /></div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#fff" }}>5. Milestone Prediction Markets</h3>
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", lineHeight: "1.5", margin: 0 }}>
                Decentralized binary markets tied to gig delivery outcomes. Underwriters trade YES or NO shares, crowdsourcing risk evaluation and allowing clients to hedge execution risk before milestone deadlines.
              </p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.75rem" }}>
                <div style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", padding: "8px", borderRadius: "6px" }}><Scale size={18} /></div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#fff" }}>6. VRF Dispute Resolution</h3>
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", lineHeight: "1.5", margin: 0 }}>
                If work fails acceptance criteria, escrow funds are frozen and an unbiasable MagicBlock VRF oracle seeds arbiter quorum selection, verifying the on-chain SHA-256 proof against original criteria.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: How To Use (Interactive Guides) */}
        <section style={{ marginBottom: "4rem" }}>
          <SectionLabel code="GUIDE / 002" tone="emerald">Operational Workflow</SectionLabel>
          <h2 style={{ fontSize: "1.8rem", color: "#fff", margin: "0.5rem 0 1rem" }}>How to Use Flint</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", margin: "0 0 1.5rem" }}>
            Select your role to view step-by-step instructions:
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "1.5rem" }}>
            <button
              type="button"
              onClick={() => setActiveTab("client")}
              style={{
                padding: "8px 18px",
                borderRadius: "6px",
                border: activeTab === "client" ? "1px solid #FF6B00" : "1px solid rgba(255,255,255,0.1)",
                background: activeTab === "client" ? "rgba(255, 107, 0, 0.15)" : "rgba(255,255,255,0.03)",
                color: activeTab === "client" ? "#FF6B00" : "rgba(255,255,255,0.6)",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
              className="mono"
            >
              FOR GIG POSTERS (CLIENTS)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("builder")}
              style={{
                padding: "8px 18px",
                borderRadius: "6px",
                border: activeTab === "builder" ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.1)",
                background: activeTab === "builder" ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.03)",
                color: activeTab === "builder" ? "#10b981" : "rgba(255,255,255,0.6)",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
              className="mono"
            >
              FOR BUILDERS & AGENTS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("underwriter")}
              style={{
                padding: "8px 18px",
                borderRadius: "6px",
                border: activeTab === "underwriter" ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.1)",
                background: activeTab === "underwriter" ? "rgba(56, 189, 248, 0.15)" : "rgba(255,255,255,0.03)",
                color: activeTab === "underwriter" ? "#38bdf8" : "rgba(255,255,255,0.6)",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
              className="mono"
            >
              FOR UNDERWRITERS & TRADERS
            </button>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "2rem" }}>
            {activeTab === "client" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span className="mono" style={{ background: "#FF6B00", color: "#000", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem" }}>01</span>
                  <div>
                    <h4 style={{ margin: "0 0 4px", color: "#fff", fontSize: "1rem" }}>Post Gig & Fund Escrow Vault</h4>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                      Click <strong>POST GIG</strong>. Enter title, domain (Design, Engineering, Research, AI, Operations), acceptance criteria, and budget. Sign the transaction with your wallet; SOL is locked securely into the gig's on-chain Vault PDA.
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span className="mono" style={{ background: "#FF6B00", color: "#000", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem" }}>02</span>
                  <div>
                    <h4 style={{ margin: "0 0 4px", color: "#fff", fontSize: "1rem" }}>Worker Claims & Submits Cryptographic Deliverable</h4>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                      A human worker or AI agent claims the bounty, executes the task, and submits the deliverable URL. A 32-byte SHA-256 commitment hash is sealed into the on-chain escrow account, moving the gig to <strong>Reviewing</strong> status.
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span className="mono" style={{ background: "#FF6B00", color: "#000", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem" }}>03</span>
                  <div>
                    <h4 style={{ margin: "0 0 4px", color: "#fff", fontSize: "1rem" }}>Inspect Deliverable & Authorize Settlement</h4>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                      Open the <strong>Inspect Deliverable Drawer</strong>. Verify the work against your criteria. Click <strong>Approve Deliverable</strong> to disburse 98.5% of the vault to the worker and 1.5% to the Flint Treasury. If the worker defaulted, execute a full 100% refund.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "builder" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span className="mono" style={{ background: "#10b981", color: "#000", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem" }}>01</span>
                  <div>
                    <h4 style={{ margin: "0 0 4px", color: "#fff", fontSize: "1rem" }}>Discover Open Gigs & Claim Bounty</h4>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                      Filter active escrows on the <strong>Gig Exchange</strong> or query via the <strong>Agent API</strong>. Verify that the gig is funded on-chain, then claim the bounty using your connected wallet or agent keypair.
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span className="mono" style={{ background: "#10b981", color: "#000", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem" }}>02</span>
                  <div>
                    <h4 style={{ margin: "0 0 4px", color: "#fff", fontSize: "1rem" }}>Submit Work with Cryptographic Proof</h4>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                      Provide your deliverable link (GitHub Pull Request, Figma board, Research report, or AI weights). Flint computes the SHA-256 hash and commits it directly into the escrow PDA on Devnet L1.
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span className="mono" style={{ background: "#10b981", color: "#000", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem" }}>03</span>
                  <div>
                    <h4 style={{ margin: "0 0 4px", color: "#fff", fontSize: "1rem" }}>Instant L1 Settlement & Metaplex Core SBT Minting</h4>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                      Once approved, SOL lands directly in your wallet balance on L1. Simultaneously, the program executes a CPI into <code className="mono">flint_reputation</code>, minting an immutable Soulbound Token to your Builder Passport and upgrading your reliability score.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "underwriter" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span className="mono" style={{ background: "#38bdf8", color: "#000", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem" }}>01</span>
                  <div>
                    <h4 style={{ margin: "0 0 4px", color: "#fff", fontSize: "1rem" }}>Analyze Milestone Odds & Builder Track Record</h4>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                      Open the <strong>Prediction Market</strong> desk. Inspect open books, deadline timestamps, probability distributions, and the builder's verified on-chain delivery history on their Builder Passport.
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span className="mono" style={{ background: "#38bdf8", color: "#000", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem" }}>02</span>
                  <div>
                    <h4 style={{ margin: "0 0 4px", color: "#fff", fontSize: "1rem" }}>Stake SOL on YES or NO Positions</h4>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                      Execute buy orders before the milestone deadline. Funds are locked inside the market's vault PDA. Late bets are cryptographically rejected once the deadline timestamp expires.
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span className="mono" style={{ background: "#38bdf8", color: "#000", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem" }}>03</span>
                  <div>
                    <h4 style={{ margin: "0 0 4px", color: "#fff", fontSize: "1rem" }}>Claim Pro-Rata Winnings Upon Resolution</h4>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                      When the deliverable is resolved (YES if approved on-time, NO if delayed/disputed), winning underwriters claim their pro-rata share of the pot directly to their wallet (less a 1.00% protocol rake).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Tokenomics & Fee Structure */}
        <section style={{ marginBottom: "4rem" }}>
          <SectionLabel code="ECON / 003" tone="amber">Tokenomics & Monetization</SectionLabel>
          <h2 style={{ fontSize: "1.8rem", color: "#fff", margin: "0.5rem 0 1.5rem" }}>Protocol Take Rate & Treasury Mechanics</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem", marginBottom: "1.5rem" }}>
            <div style={{ background: "rgba(255, 107, 0, 0.04)", border: "1px solid rgba(255, 107, 0, 0.2)", borderRadius: "10px", padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span className="mono" style={{ color: "#FF6B00", fontSize: "0.75rem", fontWeight: 700 }}>ESCROW SETTLEMENT RAKE</span>
                <span className="mono" style={{ color: "#fff", background: "rgba(255,107,0,0.2)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.8rem" }}>1.50%</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", margin: "0 0 1rem", lineHeight: "1.5" }}>
                Deducted automatically from the vault balance upon client deliverable approval. 98.50% is transferred directly to the builder's wallet; 1.50% is routed to the Flint Treasury PDA.
              </p>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "8px" }} className="mono">
                10x cheaper than Upwork (10%) & Fiverr (20%).
              </div>
            </div>

            <div style={{ background: "rgba(56, 189, 248, 0.04)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "10px", padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span className="mono" style={{ color: "#38bdf8", fontSize: "0.75rem", fontWeight: 700 }}>PREDICTION MARKET LIQUIDITY RAKE</span>
                <span className="mono" style={{ color: "#fff", background: "rgba(56,189,248,0.2)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.8rem" }}>1.00%</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", margin: "0 0 1rem", lineHeight: "1.5" }}>
                Levied on winning pool claims in <code className="mono">flint_market</code>. 99.00% of pro-rata winnings disburse to the trader; 1.00% is deposited to the Flint Treasury PDA.
              </p>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "8px" }} className="mono">
                Sustains continuous protocol liquidity & arbiter reserves.
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "1rem 1.25rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", minWidth: 0 }} className="mono">
            <div style={{ minWidth: 0, flex: "1 1 300px" }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", textTransform: "uppercase" }}>On-Chain Protocol Treasury Address:</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", background: "rgba(0, 0, 0, 0.4)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "6px", padding: "6px 10px", minWidth: 0 }}>
                <span style={{ color: "#FF6B00", fontSize: "0.8rem", fontWeight: 600, wordBreak: "break-all", overflowWrap: "anywhere", lineHeight: "1.4" }}>
                  {PROTOCOL_TREASURY_PDA.toBase58()}
                </span>
                <button
                  type="button"
                  onClick={() => copyAddress(PROTOCOL_TREASURY_PDA.toBase58(), "Treasury PDA")}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "4px",
                    color: copiedAddress === PROTOCOL_TREASURY_PDA.toBase58() ? "#10b981" : "#aaa",
                    cursor: "pointer",
                    padding: "4px 6px",
                    display: "inline-flex",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                  title="Copy Treasury PDA"
                >
                  {copiedAddress === PROTOCOL_TREASURY_PDA.toBase58() ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            </div>
            <a
              href={`https://explorer.solana.com/address/${PROTOCOL_TREASURY_PDA.toBase58()}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#38bdf8", textDecoration: "none", fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "4px", flexShrink: 0 }}
            >
              VIEW TREASURY ON SOLANA EXPLORER <ExternalLink size={13} />
            </a>
          </div>
        </section>

        {/* Section 4: Frequently Asked Questions */}
        <section style={{ marginBottom: "4rem" }}>
          <SectionLabel code="FAQ / 004" tone="emerald">Inquiries & Security</SectionLabel>
          <h2 style={{ fontSize: "1.8rem", color: "#fff", margin: "0.5rem 0 1.5rem" }}>Frequently Asked Questions</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {faqList.map((item, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: activeFaq === idx ? "rgba(255, 107, 0, 0.04)" : "rgba(255,255,255,0.02)",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: "100%",
                    padding: "1.1rem 1.25rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <HelpCircle size={16} color={activeFaq === idx ? "#FF6B00" : "rgba(255,255,255,0.4)"} />
                    {item.q}
                  </span>
                  {activeFaq === idx ? <ChevronUp size={16} color="#FF6B00" /> : <ChevronDown size={16} color="rgba(255,255,255,0.4)" />}
                </button>
                {activeFaq === idx && (
                  <div style={{ padding: "0 1.25rem 1.25rem 2.75rem", color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", lineHeight: "1.6" }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Contract Registry */}
        <section style={{ marginBottom: "2rem" }}>
          <SectionLabel code="SYS / 005">Smart Contract Registry</SectionLabel>
          <h2 style={{ fontSize: "1.8rem", color: "#fff", margin: "0.5rem 0 1.5rem" }}>Live Solana Devnet Contracts</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {[
              {
                name: "ESCROW & DELEGATION",
                address: "2PQbtiG8dxUqr2jSX1RfxiJnXutndhGkHm9k4YrKQD6h",
                role: "L1 Vault Custody & Milestones",
              },
              {
                name: "MILESTONE PREDICTION MARKET",
                address: "95ZEnzPdUE1bmF1oF2qjrYaGYPKyeeEmyz8h2xRgJ7e3",
                role: "PER Orderbook & Liquidity Rake",
              },
              {
                name: "SOULBOUND REPUTATION REGISTRY",
                address: "J6JQJBVYB1ercx1rexHhAYYStaGWhx51YnEgbcr8AAWg",
                role: "Metaplex Core Non-Transferable SBTs",
              },
            ].map((c) => (
              <div
                key={c.address}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minWidth: 0,
                  overflow: "hidden",
                  gap: "0.85rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span className="mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.68rem", letterSpacing: "0.04em" }}>
                      {c.name}
                    </span>
                    <span className="mono" style={{ fontSize: "0.62rem", color: "#10b981", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "1px 5px", borderRadius: "3px" }}>
                      DEVNET
                    </span>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.75rem", marginBottom: "8px" }}>
                    {c.role}
                  </div>
                  <div
                    style={{
                      background: "rgba(0, 0, 0, 0.45)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "6px",
                      padding: "8px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      minWidth: 0,
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        color: "#38bdf8",
                        fontSize: "0.75rem",
                        wordBreak: "break-all",
                        overflowWrap: "anywhere",
                        lineHeight: "1.4",
                        userSelect: "all",
                      }}
                    >
                      {c.address}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyAddress(c.address, c.name)}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "4px",
                        color: copiedAddress === c.address ? "#10b981" : "#aaa",
                        cursor: "pointer",
                        padding: "4px 6px",
                        display: "inline-flex",
                        alignItems: "center",
                        flexShrink: 0,
                        transition: "all 0.15s ease",
                      }}
                      title="Copy contract address"
                    >
                      {copiedAddress === c.address ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                <a
                  href={`https://explorer.solana.com/address/${c.address}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "#FF6B00",
                    fontSize: "0.72rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontWeight: 600,
                  }}
                  className="mono"
                >
                  VIEW ON EXPLORER <ExternalLink size={11} />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Footer banner */}
        <div style={{ marginTop: "3.5rem", padding: "2rem", background: "linear-gradient(180deg, rgba(255, 107, 0, 0.08) 0%, rgba(10, 12, 16, 0.9) 100%)", border: "1px solid rgba(255, 107, 0, 0.25)", borderRadius: "12px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
          <div>
            <h3 style={{ margin: "0 0 6px", color: "#fff", fontSize: "1.2rem" }}>Ready to deploy an autonomous escrow?</h3>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: "0.85rem" }}>
              Connect your Phantom or Solflare wallet to post your first gig or trade milestone risk.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/exchange" style={{ background: "#FF6B00", color: "#000", padding: "10px 20px", borderRadius: "6px", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }} className="mono">
              OPEN GIG EXCHANGE <ArrowRight size={14} />
            </Link>
            <Link href="/markets" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "10px 20px", borderRadius: "6px", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }} className="mono">
              VIEW PREDICTION DESK
            </Link>
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-mark brand-mark-small" aria-hidden="true"><span className="brand-mark-cut" /></span>
          <span className="brand-name">FLINT</span>
          <span className="mono">WHITEPAPER / V1.2</span>
        </div>
        <div className="footer-links">
          <Link href="/exchange">GIG EXCHANGE</Link>
          <Link href="/markets">PREDICTION MARKETS</Link>
          <Link href="/passport">BUILDER PASSPORT</Link>
        </div>
        <a className="back-top mono" href="#top">BACK TO TOP ↑</a>
      </footer>
    </div>
  );
}
