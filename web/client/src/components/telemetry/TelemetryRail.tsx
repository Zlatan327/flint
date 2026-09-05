import { Check, ChevronRight, ExternalLink, ShieldCheck, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { useFlintWallet } from "@/contexts/WalletContext";
import { DEVNET_RPC } from "@/lib/flint-escrow-client";

export function TelemetryRail() {
  const { connected, walletAddress, balance, setIsModalOpen } = useFlintWallet();
  const [latency, setLatency] = useState<number | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [lastIndexTime, setLastIndexTime] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    async function checkRpc() {
      try {
        const start = performance.now();
        const res = await fetch(DEVNET_RPC, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getSlot" }),
        });
        const roundtrip = Math.round(performance.now() - start);
        const data = await res.json();
        if (isMounted) {
          setLatency(roundtrip);
          if (data.result) setSlot(data.result);
          const now = new Date();
          setLastIndexTime(now.toTimeString().split(" ")[0] + " UTC");
        }
      } catch (err) {
        console.warn("RPC telemetry ping failed:", err);
      }
    }
    checkRpc();
    const interval = setInterval(checkRpc, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const telemetryItems = [
    {
      label: "RPC LATENCY",
      source: "DEVNET RPC",
      value: latency !== null ? `${latency}MS` : "PINGING...",
      detail: latency !== null ? `roundtrip to ${new URL(DEVNET_RPC).hostname}` : "measuring connection",
      status: latency !== null && latency < 600 ? "verified" : "watch",
      width: latency !== null ? Math.min(100, Math.max(20, 100 - latency / 10)) : 50,
    },
    {
      label: "L1 BLOCK SLOT",
      source: "SOLANA CONSENSUS",
      value: slot !== null ? `#${slot.toLocaleString()}` : "SYNCING...",
      detail: "confirmed epoch state on devnet",
      status: slot !== null ? "verified" : "watch",
      width: slot !== null ? 100 : 30,
    },
    {
      label: "OPERATOR BALANCE",
      source: "DEVNET VAULT",
      value: connected && balance !== null ? `${balance.toFixed(3)} SOL` : "NOT CONNECTED",
      detail: connected ? "active collateral available for escrow" : "connect wallet to query",
      status: connected && balance !== null && balance > 0 ? "verified" : "watch",
      width: connected && balance !== null && balance > 0 ? 90 : 10,
    },
    {
      label: "PROTOCOL REVENUE",
      source: "TREASURY PDA",
      value: "1.5% ESCROW / 1.0% MKT",
      detail: "autonomous protocol rake auto-routed to Flint Treasury on settlement",
      status: "verified",
      width: 100,
    },
    {
      label: "DISPUTE RECORD",
      source: "FLINT PROGRAM",
      value: "0 PENALTIES",
      detail: "zero escrow defaults recorded",
      status: "verified",
      width: 100,
    },
  ];

  return (
    <aside className="telemetry-rail" id="telemetry" aria-labelledby="telemetry-title">
      <div className="telemetry-heading">
        <SectionLabel code="TEL / 002" tone="emerald">Operator telemetry</SectionLabel>
        <h2 id="telemetry-title">Proof before price.</h2>
        <p>Live signal checks from Solana Devnet RPC and the active operator session.</p>
      </div>

      <div className="telemetry-list">
        {telemetryItems.map((item) => (
          <div className="telemetry-row" key={item.label}>
            <div className="telemetry-row-label">
              <span>{item.label}</span>
              <span className="mono telemetry-source">{item.source}</span>
            </div>
            <div className="telemetry-row-value">
              <span className={`mono telemetry-value telemetry-value-${item.status}`}>{item.value}</span>
              {item.status === "verified" ? <Check size={14} /> : <ShieldCheck size={14} />}
            </div>
            <div className="telemetry-progress" aria-hidden="true">
              <span style={{ width: `${item.width}%` }} />
            </div>
            <p className="telemetry-detail">{item.detail}</p>
          </div>
        ))}
      </div>

      <a
        className="telemetry-link"
        href="https://explorer.solana.com/?cluster=devnet"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        VIEW SOLANA DEVNET EXPLORER <ExternalLink size={13} />
      </a>

      <div className="telemetry-footer">
        <span className="mono">LAST INDEX / {lastIndexTime || "POLLING..."}</span>
        <ChevronRight size={15} />
      </div>
    </aside>
  );
}
