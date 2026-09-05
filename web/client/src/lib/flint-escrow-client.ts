import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";

export const DEVNET_RPC = "https://api.devnet.solana.com";
export const ESCROW_PROGRAM_ID = new PublicKey(
  "2PQbtiG8dxUqr2jSX1RfxiJnXutndhGkHm9k4YrKQD6h"
);

// Anchor 8-byte instruction discriminators (precomputed sha256("global:<name>")[:8])
const INIT_GIG_DISCRIMINATOR = new Uint8Array([
  0x03, 0xf6, 0x53, 0x88, 0xa7, 0xab, 0xc9, 0xb5,
]);
const DEPOSIT_ESCROW_DISCRIMINATOR = new Uint8Array([
  0xe2, 0x70, 0x9e, 0xb0, 0xb2, 0x76, 0x99, 0x80,
]);

/**
 * Packs 64-bit unsigned integer into 8 bytes little-endian
 */
function packU64LE(value: bigint | number): Uint8Array {
  const buf = new Uint8Array(8);
  const view = new DataView(buf.buffer);
  view.setBigUint64(0, BigInt(value), true);
  return buf;
}

/**
 * Packs 64-bit signed integer into 8 bytes little-endian
 */
function packI64LE(value: bigint | number): Uint8Array {
  const buf = new Uint8Array(8);
  const view = new DataView(buf.buffer);
  view.setBigInt64(0, BigInt(value), true);
  return buf;
}

export interface PostGigParams {
  title: string;
  budgetSol: number;
  lane: string;
  model: "BOUNTY" | "CONTEST";
  clientPubkey: PublicKey;
}

export interface EscrowTxResult {
  txSignature: string;
  gigId: number;
  gigEscrowPda: string;
  vaultPda: string;
  explorerUrl: string;
}

/**
 * Builds and sends a real atomic Solana transaction to initialize and deposit escrow
 */
export async function initializeAndDepositEscrow(
  params: PostGigParams,
  provider: any
): Promise<EscrowTxResult> {
  const connection = new Connection(DEVNET_RPC, "confirmed");

  // Generate unique 6-digit gig ID
  const gigId = Math.floor(100000 + Math.random() * 900000);
  const gigIdBytes = packU64LE(gigId);

  // Derive PDAs
  const [gigEscrowPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("gig_escrow"), Buffer.from(gigIdBytes)],
    ESCROW_PROGRAM_ID
  );

  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), gigEscrowPda.toBuffer()],
    ESCROW_PROGRAM_ID
  );

  // Convert SOL budget to lamports (default to 0.01 SOL minimum)
  const lamports = Math.max(
    1_000_000,
    Math.round((params.budgetSol || 0.01) * 1_000_000_000)
  );
  const milestonesCount = 1;
  const deadlineTimestamp = Math.floor(Date.now() / 1000) + 7 * 86400; // 7 days
  const settlementModelCode = params.model === "BOUNTY" ? 0 : 1;

  // 1. Build initialize_gig instruction data
  // [discriminator (8B), gig_id (8B), total_amount (8B), milestones_count (1B), deadline (8B), model_code (1B)]
  const initData = new Uint8Array(8 + 8 + 8 + 1 + 8 + 1);
  initData.set(INIT_GIG_DISCRIMINATOR, 0);
  initData.set(packU64LE(gigId), 8);
  initData.set(packU64LE(lamports), 16);
  initData[24] = milestonesCount;
  initData.set(packI64LE(deadlineTimestamp), 25);
  initData[33] = settlementModelCode;

  const initInstruction = new TransactionInstruction({
    programId: ESCROW_PROGRAM_ID,
    data: Buffer.from(initData),
    keys: [
      { pubkey: gigEscrowPda, isSigner: false, isWritable: true },
      { pubkey: params.clientPubkey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
  });

  // 2. Build deposit_escrow instruction data
  // [discriminator (8B), amount (8B)]
  const depositData = new Uint8Array(8 + 8);
  depositData.set(DEPOSIT_ESCROW_DISCRIMINATOR, 0);
  depositData.set(packU64LE(lamports), 8);

  const depositInstruction = new TransactionInstruction({
    programId: ESCROW_PROGRAM_ID,
    data: Buffer.from(depositData),
    keys: [
      { pubkey: gigEscrowPda, isSigner: false, isWritable: true },
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: params.clientPubkey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
  });

  // Bundle into a single atomic transaction
  const transaction = new Transaction().add(initInstruction, depositInstruction);
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = params.clientPubkey;

  // Sign & Send with user's connected wallet
  let txSignature = "";

  if (provider.signAndSendTransaction) {
    const res = await provider.signAndSendTransaction(transaction);
    txSignature = res.signature || res.toString();
  } else if (provider.sendTransaction) {
    txSignature = await provider.sendTransaction(transaction, connection);
  } else {
    throw new Error("Connected wallet does not support signing transactions.");
  }

  // Await confirmation
  await connection.confirmTransaction(txSignature, "confirmed");

  return {
    txSignature,
    gigId,
    gigEscrowPda: gigEscrowPda.toBase58(),
    vaultPda: vaultPda.toBase58(),
    explorerUrl: `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`,
  };
}
