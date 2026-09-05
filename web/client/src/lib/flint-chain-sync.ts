import { Connection, PublicKey } from "@solana/web3.js";
import { DEVNET_RPC, ESCROW_PROGRAM_ID } from "./flint-escrow-client";
import { Gig } from "./flint-data";

export interface OnChainGigEscrow {
  pubkey: string;
  client: string;
  freelancer: string;
  gigId: number;
  totalAmountLamports: bigint;
  totalAmountSol: number;
  remainingAmountLamports: bigint;
  remainingAmountSol: number;
  deadlineTimestamp: number;
  milestonesCount: number;
  completedMilestones: number;
  status: "Initialized" | "Funded" | "InProgress" | "Reviewing" | "ActiveInRollup" | "ReadyForSettlement" | "Completed" | "Disputed";
  settlementModel: "Bounty" | "Contest";
  isFreelancerAssigned: boolean;
  deliverableHash: string;
}

const STATUS_MAP: OnChainGigEscrow["status"][] = [
  "Initialized",
  "Funded",
  "InProgress",
  "Reviewing",
  "ActiveInRollup",
  "ReadyForSettlement",
  "Completed",
  "Disputed",
];

/**
 * Decodes on-chain GigEscrow account binary buffer
 */
export function decodeGigEscrow(pubkey: PublicKey, accountData: Buffer | Uint8Array): OnChainGigEscrow | null {
  if (accountData.length < 110) return null;

  try {
    const data = accountData instanceof Uint8Array ? accountData : new Uint8Array(accountData);
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

    const client = new PublicKey(data.subarray(8, 40)).toBase58();
    const freelancer = new PublicKey(data.subarray(40, 72)).toBase58();
    const gigId = Number(view.getBigUint64(72, true));
    const totalAmountLamports = view.getBigUint64(80, true);
    const remainingAmountLamports = view.getBigUint64(88, true);
    const deadlineTimestamp = Number(view.getBigInt64(96, true));
    const milestonesCount = data[104];
    const completedMilestones = data[105];
    const statusCode = data[106] ?? 0;
    const settlementCode = data[107] ?? 0;
    const isFreelancerAssigned = Boolean(data[108]);

    let deliverableHash = "";
    if (data.length >= 141) {
      const hashBytes = data.subarray(109, 141);
      deliverableHash = Array.from(hashBytes).map(b => b.toString(16).padStart(2, "0")).join("");
    }

    return {
      pubkey: pubkey.toBase58(),
      client,
      freelancer,
      gigId,
      totalAmountLamports,
      totalAmountSol: Number(totalAmountLamports) / 1_000_000_000,
      remainingAmountLamports,
      remainingAmountSol: Number(remainingAmountLamports) / 1_000_000_000,
      deadlineTimestamp,
      milestonesCount,
      completedMilestones,
      status: STATUS_MAP[statusCode] || "Initialized",
      settlementModel: settlementCode === 0 ? "Bounty" : "Contest",
      isFreelancerAssigned,
      deliverableHash,
    };
  } catch (err) {
    console.error("Failed to decode GigEscrow account:", err);
    return null;
  }
}

const GIG_METADATA_STORAGE_KEY = "flint_gig_metadata_store";

export interface OffChainGigMeta {
  title?: string;
  category?: Gig["category"];
  lane?: Gig["lane"];
  description?: string;
  acceptanceCriteria?: string;
  deliverableType?: Gig["deliverableType"];
  deliverableUrl?: string;
  deliverableNotes?: string;
  deliverableHash?: string;
}

export function saveGigMetadata(gigId: number | string, pda: string, meta: OffChainGigMeta) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(GIG_METADATA_STORAGE_KEY);
    const store: Record<string, OffChainGigMeta> = raw ? JSON.parse(raw) : {};
    store[pda] = { ...store[pda], ...meta };
    store[String(gigId)] = { ...store[String(gigId)], ...meta };
    store[`GIG-${gigId}`] = { ...store[`GIG-${gigId}`], ...meta };
    localStorage.setItem(GIG_METADATA_STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.warn("Failed to save gig metadata:", err);
  }
}

export function getGigMetadata(key: string): OffChainGigMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GIG_METADATA_STORAGE_KEY);
    if (!raw) return null;
    const store: Record<string, OffChainGigMeta> = JSON.parse(raw);
    return store[key] || null;
  } catch {
    return null;
  }
}

/**
 * Fetches all live on-chain GigEscrows from Solana Devnet
 */
export async function fetchOnChainGigs(): Promise<Gig[]> {
  try {
    const connection = new Connection(DEVNET_RPC, "confirmed");
    const accounts = await connection.getProgramAccounts(ESCROW_PROGRAM_ID);

    const parsedGigs: Gig[] = [];

    for (const { pubkey, account } of accounts) {
      const decoded = decodeGigEscrow(pubkey, account.data);
      if (!decoded) continue;

      const now = Math.floor(Date.now() / 1000);
      const remainingSeconds = Math.max(0, decoded.deadlineTimestamp - now);
      const days = Math.floor(remainingSeconds / 86400);
      const hours = Math.floor((remainingSeconds % 86400) / 3600);
      const deadlineStr = remainingSeconds > 0 ? `${days}D ${hours.toString().padStart(2, "0")}H` : "EXPIRED";

      let uiStatus: Gig["status"] = "Accepting";
      if (decoded.status === "Completed") uiStatus = "Funded";
      else if (decoded.status === "Reviewing" || decoded.status === "InProgress") uiStatus = "Reviewing";

      const meta =
        getGigMetadata(decoded.pubkey) ||
        getGigMetadata(String(decoded.gigId)) ||
        getGigMetadata(`GIG-${decoded.gigId}`);

      parsedGigs.push({
        id: `GIG-${decoded.gigId}`,
        title: meta?.title || `${decoded.settlementModel} Escrow #${decoded.gigId}`,
        category: meta?.category || "ENGINEERING",
        lane: meta?.lane || "Human → Agent",
        budget: `${decoded.totalAmountSol.toFixed(2)} SOL`,
        deadline: deadlineStr,
        submissions: decoded.isFreelancerAssigned ? 1 : 0,
        verification: decoded.settlementModel === "Bounty" ? "COMMIT-REVEAL" : "CONTEST",
        status: uiStatus,
        deliverableType: meta?.deliverableType,
        deliverableUrl: meta?.deliverableUrl,
        deliverableNotes: meta?.deliverableNotes,
        deliverableHash: decoded.deliverableHash || meta?.deliverableHash,
        description: meta?.description || `Autonomous Solana Devnet escrow with ${decoded.totalAmountSol.toFixed(2)} SOL locked in vault.`,
        acceptanceCriteria: meta?.acceptanceCriteria || "Cryptographic SHA-256 deliverable payload confirmed before settlement.",
        pda: decoded.pubkey,
        client: decoded.client,
        freelancer: decoded.freelancer,
      });
    }

    return parsedGigs;
  } catch (err) {
    console.warn("Could not load on-chain gigs from Devnet RPC (network may be slow):", err);
    return [];
  }
}
