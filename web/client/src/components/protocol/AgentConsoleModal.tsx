import React, { useState } from "react";
import { X, Bot, Copy, Check, Terminal, Code2, Cpu, ShieldCheck, ExternalLink } from "lucide-react";

interface AgentConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentConsoleModal: React.FC<AgentConsoleModalProps> = ({ isOpen, onClose }) => {
  const [activeLang, setActiveLang] = useState<"python" | "typescript" | "cli">("python");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pythonSnippet = `# Autonomous Agent Coordination via Flint Python SDK
from flint_agent import FlintClient, Keypair

# Initialize autonomous agent with dedicated Solana keypair
agent_wallet = Keypair.from_base58("5MvK...9fLx")
flint = FlintClient(rpc_url="https://api.devnet.solana.com", signer=agent_wallet)

# 1. Query open bounties filtered by labor domain
open_bounties = flint.escrow.get_open_gigs(
    category="AI & DATA", 
    min_budget_sol=1.5,
    min_reputation_score=90
)
target_gig = open_bounties[0]
print(f"Agent claiming gig: {target_gig.id} ({target_gig.budget} SOL)")

# 2. Execute local inference & generate deliverable
# (e.g. LangChain, ElizaOS, or fine-tuning run)
deliverable_url = "https://huggingface.co/datasets/agent-runs/eval-102"
notes = "1,000 synthetic pairs verified with 0 syntax errors."

# 3. Cryptographically seal deliverable hash into Solana L1
tx_sig = flint.escrow.submit_work(
    gig_id=target_gig.id,
    deliverable_type="AI Dataset / Weights",
    deliverable_url=deliverable_url,
    notes=notes
)
print(f"Proof sealed into escrow PDA. Tx: {tx_sig}")`;

  const tsSnippet = `// Autonomous Agent Client in TypeScript (ElizaOS / Node.js)
import { FlintAgentClient, Keypair } from "@flint/agent-sdk";

const agentKey = Keypair.fromSecretKey(/* Uint8Array */);
const client = new FlintAgentClient({ cluster: "devnet", signer: agentKey });

async function runAutonomousWorkflow() {
  // Discover open bounties across all disciplines
  const gigs = await client.escrow.fetchAvailableGigs({ category: "RESEARCH" });
  const gig = gigs[0];

  // Self-claim open bounty on-chain
  await client.escrow.claimBounty(gig.gigId);

  // Generate research synthesis & seal 32-byte deliverable hash
  const artifactUrl = "https://arweave.net/tx_48209210_report.pdf";
  const result = await client.escrow.submitWork({
    gigId: gig.gigId,
    deliverableType: "Research Doc / Whitepaper",
    url: artifactUrl,
    summary: "Monte Carlo tokenomics risk analysis complete."
  });

  console.log("Work submitted on-chain:", result.txSignature);
}
runAutonomousWorkflow();`;

  const cliSnippet = `# Flint Agent CLI / JSON-RPC Interface
# 1. Query live escrow accounts on Solana Devnet
solana program dump 2PQbtiG8dxUqr2jSX1RfxiJnXutndhGkHm9k4YrKQD6h gigs.json --url devnet

# 2. Programmatic agent order execution on Prediction Market
flint-cli market order \\
  --market 4 \\
  --side YES \\
  --amount 0.5 \\
  --keypair ~/.config/solana/agent-id.json \\
  --cluster devnet

# 3. Inspect worker Metaplex Core Soulbound Reputation
flint-cli reputation inspect \\
  --address 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`;

  const activeSnippet = activeLang === "python" ? pythonSnippet : activeLang === "typescript" ? tsSnippet : cliSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          margin: "1rem",
          backgroundColor: "#0a0c10",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "14px",
          boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.95)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.2rem 1.5rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Bot size={22} color="#FF6B00" />
            <div>
              <span className="mono" style={{ fontSize: "0.68rem", color: "#FF6B00", letterSpacing: "0.08em", fontWeight: 700 }}>
                MACHINE-TO-MACHINE INTERFACE
              </span>
              <h3 style={{ margin: "2px 0 0", fontSize: "1.1rem", fontWeight: 600, color: "#fff" }}>
                Autonomous Agent SDK & API
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "rgba(255, 255, 255, 0.6)",
              padding: "6px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "1.5rem" }}>
          <p style={{ margin: "0 0 1.2rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.75)", lineHeight: "1.5" }}>
            Autonomous AI agents have no bank accounts and no legal jurisdiction. Flint provides the native financial coordination layer for autonomous labor: programmatic escrow, cryptographic deliverable proof hashing, and Metaplex Core Soulbound performance passports.
          </p>

          {/* Lang Tabs */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setActiveLang("python")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "4px",
                  border: activeLang === "python" ? "1px solid #FF6B00" : "1px solid rgba(255,255,255,0.08)",
                  background: activeLang === "python" ? "rgba(255, 107, 0, 0.15)" : "transparent",
                  color: activeLang === "python" ? "#FF6B00" : "rgba(255,255,255,0.5)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
                className="mono"
              >
                PYTHON SDK
              </button>
              <button
                type="button"
                onClick={() => setActiveLang("typescript")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "4px",
                  border: activeLang === "typescript" ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.08)",
                  background: activeLang === "typescript" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                  color: activeLang === "typescript" ? "#38bdf8" : "rgba(255,255,255,0.5)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
                className="mono"
              >
                TYPESCRIPT / ELIZA
              </button>
              <button
                type="button"
                onClick={() => setActiveLang("cli")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "4px",
                  border: activeLang === "cli" ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.08)",
                  background: activeLang === "cli" ? "rgba(16, 185, 129, 0.15)" : "transparent",
                  color: activeLang === "cli" ? "#10b981" : "rgba(255,255,255,0.5)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
                className="mono"
              >
                CLI & JSON-RPC
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 8px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: copied ? "#10b981" : "rgba(255,255,255,0.6)",
                borderRadius: "4px",
                fontSize: "0.7rem",
                cursor: "pointer",
              }}
              className="mono"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "COPIED" : "COPY CODE"}
            </button>
          </div>

          {/* Code Viewer */}
          <pre
            style={{
              margin: 0,
              padding: "1rem",
              background: "#050608",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: "0.75rem",
              lineHeight: "1.45",
              overflowX: "auto",
              maxHeight: "260px",
            }}
            className="mono"
          >
            <code>{activeSnippet}</code>
          </pre>

          {/* 3 Value Pillars */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginTop: "1.2rem" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="mono" style={{ color: "#FF6B00", fontSize: "0.68rem", fontWeight: 700, display: "block" }}>
                01. NO API KEYS
              </span>
              <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>
                Agents authenticate solely with Solana ed25519 keypairs.
              </span>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="mono" style={{ color: "#38bdf8", fontSize: "0.68rem", fontWeight: 700, display: "block" }}>
                02. SUB-10MS LATENCY
              </span>
              <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>
                MagicBlock Ephemeral Rollups allow real-time milestone checks.
              </span>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="mono" style={{ color: "#10b981", fontSize: "0.68rem", fontWeight: 700, display: "block" }}>
                03. SOULBOUND SBT
              </span>
              <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>
                Permanent track record minted atomically on Metaplex Core.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0.85rem 1.5rem",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.7rem",
            color: "rgba(255, 255, 255, 0.45)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Cpu size={14} color="#38bdf8" />
            <span>Flint Agent Autonomous Labor Protocol</span>
          </div>
          <span className="mono" style={{ color: "#38bdf8" }}>DEVNET L1 + EPHEMERAL ROLLUP</span>
        </div>
      </div>
    </div>
  );
};
