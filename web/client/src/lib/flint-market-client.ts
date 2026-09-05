import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { DEVNET_RPC } from "./flint-escrow-client";

export const MARKET_PROGRAM_ID = new PublicKey(
  "95ZEnzPdUE1bmF1oF2qjrYaGYPKyeeEmyz8h2xRgJ7e3"
);

const PLACE_ORDER_DISCRIMINATOR = new Uint8Array([
  0xbb, 0x60, 0xaa, 0x6d, 0xfb, 0x2c, 0x38, 0xd3,
]);
const CLAIM_PAYOUT_DISCRIMINATOR = new Uint8Array([
  0x7f, 0xf0, 0x84, 0x3e, 0xe3, 0xc6, 0x92, 0x85,
]);

function packU64LE(value: bigint | number): Uint8Array {
  const buf = new Uint8Array(8);
  const view = new DataView(buf.buffer);
  view.setBigUint64(0, BigInt(value), true);
  return buf;
}

export interface PlaceOrderParams {
  marketId: number;
  isYes: boolean;
  amountSol: number;
  traderPubkey: PublicKey;
}

export interface MarketTxResult {
  txSignature: string;
  marketPda: string;
  positionPda: string;
  explorerUrl: string;
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
    [Buffer.from("milestone_market"), Buffer.from(marketIdBytes)],
    MARKET_PROGRAM_ID
  );

  // Derive Vault PDA: [b"vault", market_key]
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), marketPda.toBuffer()],
    MARKET_PROGRAM_ID
  );

  // Derive Position PDA: [b"position", market_key, trader_key]
  const [positionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("position"), marketPda.toBuffer(), params.traderPubkey.toBuffer()],
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
