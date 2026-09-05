import { Buffer } from "buffer";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { DEVNET_RPC } from "./flint-escrow-client";

const textEncoder = new TextEncoder();

export const MARKET_PROGRAM_ID = new PublicKey(
  "95ZEnzPdUE1bmF1oF2qjrYaGYPKyeeEmyz8h2xRgJ7e3"
);

const CREATE_MARKET_DISCRIMINATOR = new Uint8Array([
  0xb2, 0x30, 0x08, 0x19, 0x92, 0x17, 0x30, 0xd8,
]);
const PLACE_ORDER_DISCRIMINATOR = new Uint8Array([
  0xbb, 0x60, 0xaa, 0x6d, 0xfb, 0x2c, 0x38, 0xd3,
]);
const CLAIM_PAYOUT_DISCRIMINATOR = new Uint8Array([
  0x7f, 0xf0, 0x84, 0x3e, 0xe3, 0xc6, 0x92, 0x85,
]);

const MILESTONE_MARKET_DISC = new Uint8Array([
  0x3a, 0xdc, 0xd7, 0x89, 0xdf, 0x1d, 0xb1, 0xdf,
]);
const TRADER_POSITION_DISC = new Uint8Array([
  0xbe, 0xb0, 0x74, 0x5c, 0x18, 0x3c, 0xd1, 0xc6,
]);

function packU64LE(value: bigint | number): Uint8Array {
  const buf = new Uint8Array(8);
  const view = new DataView(buf.buffer);
  view.setBigUint64(0, BigInt(value), true);
  return buf;
}

function packI64LE(value: bigint | number): Uint8Array {
  const buf = new Uint8Array(8);
  const view = new DataView(buf.buffer);
  view.setBigInt64(0, BigInt(value), true);
  return buf;
}

export interface PlaceOrderParams {
  marketId: number;
  isYes: boolean;
  amountSol: number;
  traderPubkey: PublicKey;
}

export interface CreateMarketParams {
  marketId: number;
  gigId: number;
  marketType: 0 | 1 | 2; // 0 = Velocity, 1 = Quality, 2 = Race
  targetTimestamp: number;
  authority: PublicKey;
}

export interface MarketTxResult {
  txSignature: string;
  marketPda: string;
  positionPda?: string;
  explorerUrl: string;
}

export interface DecodedMarket {
  pda: string;
  authority: string;
  marketId: number;
  gigId: number;
  marketType: number;
  targetTimestamp: number;
  yesPoolLamports: bigint;
  noPoolLamports: bigint;
  totalVolumeLamports: bigint;
  yesPoolSol: number;
  noPoolSol: number;
  totalVolumeSol: number;
  isResolved: boolean;
  winningOutcome: boolean | null;
  isPrivateErActive: boolean;
}

export interface DecodedPosition {
  pda: string;
  owner: string;
  market: string;
  yesSharesLamports: bigint;
  noSharesLamports: bigint;
  yesSharesSol: number;
  noSharesSol: number;
}

/**
 * Decodes MilestoneMarket on-chain account
 */
export function decodeMilestoneMarket(pubkey: PublicKey, rawData: Buffer | Uint8Array): DecodedMarket | null {
  if (rawData.length < 94) return null;
  const data = rawData instanceof Uint8Array ? rawData : new Uint8Array(rawData);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  try {
    const authority = new PublicKey(data.subarray(8, 40)).toBase58();
    const marketId = Number(view.getBigUint64(40, true));
    const gigId = Number(view.getBigUint64(48, true));
    const marketType = data[56];
    const targetTimestamp = Number(view.getBigInt64(57, true));
    const yesPoolLamports = view.getBigUint64(65, true);
    const noPoolLamports = view.getBigUint64(73, true);
    const totalVolumeLamports = view.getBigUint64(81, true);
    const isResolved = Boolean(data[89]);
    const hasWinner = Boolean(data[90]);
    const winningOutcome = hasWinner ? Boolean(data[91]) : null;
    const isPrivateErActive = Boolean(data[92]);

    return {
      pda: pubkey.toBase58(),
      authority,
      marketId,
      gigId,
      marketType,
      targetTimestamp,
      yesPoolLamports,
      noPoolLamports,
      totalVolumeLamports,
      yesPoolSol: Number(yesPoolLamports) / 1_000_000_000,
      noPoolSol: Number(noPoolLamports) / 1_000_000_000,
      totalVolumeSol: Number(totalVolumeLamports) / 1_000_000_000,
      isResolved,
      winningOutcome,
      isPrivateErActive,
    };
  } catch (err) {
    console.error("Failed to decode MilestoneMarket:", err);
    return null;
  }
}

/**
 * Decodes TraderPosition on-chain account
 */
export function decodeTraderPosition(pubkey: PublicKey, rawData: Buffer | Uint8Array): DecodedPosition | null {
  if (rawData.length < 88) return null;
  const data = rawData instanceof Uint8Array ? rawData : new Uint8Array(rawData);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  try {
    const owner = new PublicKey(data.subarray(8, 40)).toBase58();
    const market = new PublicKey(data.subarray(40, 72)).toBase58();
    const yesSharesLamports = view.getBigUint64(72, true);
    const noSharesLamports = view.getBigUint64(80, true);

    return {
      pda: pubkey.toBase58(),
      owner,
      market,
      yesSharesLamports,
      noSharesLamports,
      yesSharesSol: Number(yesSharesLamports) / 1_000_000_000,
      noSharesSol: Number(noSharesLamports) / 1_000_000_000,
    };
  } catch (err) {
    console.error("Failed to decode TraderPosition:", err);
    return null;
  }
}

/**
 * Fetches all live on-chain markets from Solana Devnet
 */
export async function fetchOnChainMarkets(): Promise<any[]> {
  try {
    const connection = new Connection(DEVNET_RPC, "confirmed");
    const accounts = await connection.getProgramAccounts(MARKET_PROGRAM_ID);

    const marketsList: any[] = [];

    for (const { pubkey, account } of accounts) {
      if (account.data.length >= 94) {
        // Verify discriminator
        const isMarket = MILESTONE_MARKET_DISC.every((byte, idx) => account.data[idx] === byte);
        if (!isMarket) continue;

        const decoded = decodeMilestoneMarket(pubkey, account.data);
        if (!decoded) continue;

        const totalPool = decoded.yesPoolSol + decoded.noPoolSol;
        const prob = totalPool > 0 ? Math.round((decoded.yesPoolSol / totalPool) * 100) : 50;

        const now = Math.floor(Date.now() / 1000);
        const remaining = Math.max(0, decoded.targetTimestamp - now);
        const hours = Math.floor(remaining / 3600);
        const mins = Math.floor((remaining % 3600) / 60);
        const expiry = remaining > 0 ? `${hours}H ${mins}M` : "EXPIRED";

        let status: "Open" | "Closing" | "Settled" = "Open";
        if (decoded.isResolved) status = "Settled";
        else if (remaining < 3600) status = "Closing";

        marketsList.push({
          id: String(decoded.marketId).padStart(3, "0"),
          title: `Delivery Milestone: Gig #${decoded.gigId}`,
          category: decoded.marketType === 0 ? "VELOCITY / TIME" : decoded.marketType === 1 ? "QUALITY / COVERAGE" : "RACE / BOUNTY",
          status,
          probability: prob,
          volume: decoded.totalVolumeSol.toFixed(2),
          expiry,
          change: "+0.0%",
          changeTone: "positive",
          tags: ["ON-CHAIN DEVNET", decoded.isPrivateErActive ? "PER DARK POOL" : "PUBLIC ORDER BOOK"],
          activity: [50, 50, prob],
          pda: decoded.pda,
          gigId: decoded.gigId,
          yesPoolSol: decoded.yesPoolSol,
          noPoolSol: decoded.noPoolSol,
        });
      }
    }

    return marketsList;
  } catch (err) {
    console.warn("Could not load markets from Devnet RPC:", err);
    return [];
  }
}

/**
 * Fetches positions for a specific connected user on Solana Devnet
 */
export async function fetchUserTraderPositions(traderPubkey: PublicKey): Promise<any[]> {
  try {
    const connection = new Connection(DEVNET_RPC, "confirmed");
    const accounts = await connection.getProgramAccounts(MARKET_PROGRAM_ID);

    const positionsList: any[] = [];

    for (const { pubkey, account } of accounts) {
      if (account.data.length >= 88) {
        const isPosition = TRADER_POSITION_DISC.every((byte, idx) => account.data[idx] === byte);
        if (!isPosition) continue;

        const decoded = decodeTraderPosition(pubkey, account.data);
        if (!decoded) continue;

        if (decoded.owner === traderPubkey.toBase58()) {
          if (decoded.yesSharesSol > 0) {
            positionsList.push({
              marketId: `PDA-${decoded.market.slice(0, 4)}...${decoded.market.slice(-4)}`,
              side: "YES",
              stake: `${decoded.yesSharesSol.toFixed(3)} SOL`,
              returnValue: `+${(decoded.yesSharesSol * 0.95).toFixed(3)} SOL`,
              move: "LIVE DEVNET",
              pda: decoded.pda,
            });
          }
          if (decoded.noSharesSol > 0) {
            positionsList.push({
              marketId: `PDA-${decoded.market.slice(0, 4)}...${decoded.market.slice(-4)}`,
              side: "NO",
              stake: `${decoded.noSharesSol.toFixed(3)} SOL`,
              returnValue: `+${(decoded.noSharesSol * 0.95).toFixed(3)} SOL`,
              move: "LIVE DEVNET",
              pda: decoded.pda,
            });
          }
        }
      }
    }

    return positionsList;
  } catch (err) {
    console.warn("Could not load user positions from Devnet RPC:", err);
    return [];
  }
}

/**
 * Initializes a live prediction market on Solana Devnet
 */
export async function createMarketOnChain(
  params: CreateMarketParams,
  provider: any
): Promise<MarketTxResult> {
  const connection = new Connection(DEVNET_RPC, "confirmed");

  const marketIdBytes = packU64LE(params.marketId);
  const [marketPda] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("milestone_market"), marketIdBytes],
    MARKET_PROGRAM_ID
  );

  // Build instruction data: [disc (8B), market_id (8B), gig_id (8B), market_type (1B), target_timestamp (8B)]
  const data = new Uint8Array(8 + 8 + 8 + 1 + 8);
  data.set(CREATE_MARKET_DISCRIMINATOR, 0);
  data.set(marketIdBytes, 8);
  data.set(packU64LE(params.gigId), 16);
  data[24] = params.marketType;
  data.set(packI64LE(params.targetTimestamp), 25);

  const instruction = new TransactionInstruction({
    programId: MARKET_PROGRAM_ID,
    data: Buffer.from(data),
    keys: [
      { pubkey: marketPda, isSigner: false, isWritable: true },
      { pubkey: params.authority, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
  });

  const transaction = new Transaction().add(instruction);
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = params.authority;

  let txSignature = "";
  if (provider.signAndSendTransaction) {
    const res = await provider.signAndSendTransaction(transaction);
    txSignature = res.signature || res.toString();
  } else if (provider.sendTransaction) {
    txSignature = await provider.sendTransaction(transaction, connection);
  } else {
    throw new Error("Connected wallet does not support signing transactions.");
  }

  await connection.confirmTransaction(txSignature, "confirmed");

  return {
    txSignature,
    marketPda: marketPda.toBase58(),
    explorerUrl: `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`,
  };
}

/**
 * Places a live order in the prediction market on Solana Devnet
 */
export async function placeMarketOrderOnChain(
  params: PlaceOrderParams,
  provider: any
): Promise<MarketTxResult> {
  const connection = new Connection(DEVNET_RPC, "confirmed");

  // Derive Market PDA: [b"milestone_market", market_id_le]
  const marketIdBytes = packU64LE(params.marketId);
  const [marketPda] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("milestone_market"), marketIdBytes],
    MARKET_PROGRAM_ID
  );

  // Derive Vault PDA: [b"vault", market_key]
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("vault"), marketPda.toBytes()],
    MARKET_PROGRAM_ID
  );

  // Derive Position PDA: [b"position", market_key, trader_key]
  const [positionPda] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("position"), marketPda.toBytes(), params.traderPubkey.toBytes()],
    MARKET_PROGRAM_ID
  );

  // Convert amount to lamports (default to 0.01 SOL)
  const lamports = Math.max(
    1_000_000,
    Math.round((params.amountSol || 0.01) * 1_000_000_000)
  );

  // Build instruction data:
  // [discriminator (8B), is_yes (1B), amount (8B), encrypted_proof (64B)]
  const data = new Uint8Array(8 + 1 + 8 + 64);
  data.set(PLACE_ORDER_DISCRIMINATOR, 0);
  data[8] = params.isYes ? 1 : 0;
  data.set(packU64LE(lamports), 9);
  // 64-byte encrypted zero proof for PER simulation
  data.set(new Uint8Array(64), 17);

  const instruction = new TransactionInstruction({
    programId: MARKET_PROGRAM_ID,
    data: Buffer.from(data),
    keys: [
      { pubkey: marketPda, isSigner: false, isWritable: true },
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: positionPda, isSigner: false, isWritable: true },
      { pubkey: params.traderPubkey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
  });

  const transaction = new Transaction().add(instruction);
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = params.traderPubkey;

  let txSignature = "";
  if (provider.signAndSendTransaction) {
    const res = await provider.signAndSendTransaction(transaction);
    txSignature = res.signature || res.toString();
  } else if (provider.sendTransaction) {
    txSignature = await provider.sendTransaction(transaction, connection);
  } else {
    throw new Error("Connected wallet does not support signing transactions.");
  }

  await connection.confirmTransaction(txSignature, "confirmed");

  return {
    txSignature,
    marketPda: marketPda.toBase58(),
    positionPda: positionPda.toBase58(),
    explorerUrl: `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`,
  };
}

export const MARKET_RAKE_BPS = 100; // 1.00% protocol market rake

export interface MarketPayoutSplit {
  grossSol: number;
  marketRakeSol: number;
  traderPayoutSol: number;
  rakePercentage: number;
}

export function calculateMarketPayoutSplit(grossSol: number): MarketPayoutSplit {
  const rake = (grossSol * MARKET_RAKE_BPS) / 10000;
  const net = grossSol - rake;
  return {
    grossSol,
    marketRakeSol: Number(rake.toFixed(4)),
    traderPayoutSol: Number(net.toFixed(4)),
    rakePercentage: 1.0,
  };
}

/**
 * Claims resolved market payout on-chain with protocol rake deduction
 */
export async function claimMarketPayoutOnChain(
  marketPdaStr: string,
  traderPubkey: PublicKey,
  provider: any
): Promise<string> {
  const connection = new Connection(DEVNET_RPC, "confirmed");
  const marketPda = new PublicKey(marketPdaStr);

  const [vaultPda] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("vault"), marketPda.toBytes()],
    MARKET_PROGRAM_ID
  );

  const [positionPda] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("position"), marketPda.toBytes(), traderPubkey.toBytes()],
    MARKET_PROGRAM_ID
  );

  // Derive protocol treasury PDA from escrow program
  const ESCROW_PROGRAM_ID = new PublicKey("2PQbtiG8dxUqr2jSX1RfxiJnXutndhGkHm9k4YrKQD6h");
  const [treasuryPda] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("treasury")],
    ESCROW_PROGRAM_ID
  );

  const instruction = new TransactionInstruction({
    programId: MARKET_PROGRAM_ID,
    data: Buffer.from(CLAIM_PAYOUT_DISCRIMINATOR),
    keys: [
      { pubkey: marketPda, isSigner: false, isWritable: true },
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: positionPda, isSigner: false, isWritable: true },
      { pubkey: treasuryPda, isSigner: false, isWritable: true },
      { pubkey: traderPubkey, isSigner: true, isWritable: true },
    ],
  });

  const transaction = new Transaction().add(instruction);
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = traderPubkey;

  let txSignature = "";
  if (provider.signAndSendTransaction) {
    const res = await provider.signAndSendTransaction(transaction);
    txSignature = res.signature || res.toString();
  } else if (provider.sendTransaction) {
    txSignature = await provider.sendTransaction(transaction, connection);
  } else {
    throw new Error("Connected wallet does not support signing transactions.");
  }

  await connection.confirmTransaction(txSignature, "confirmed");
  return txSignature;
}
