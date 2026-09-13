import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { FlintMarket } from "../target/types/flint_market";
import { assert } from "chai";

describe("flint-market", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.FlintMarket as Program<FlintMarket>;

  const authority = anchor.web3.Keypair.generate();
  const trader1 = anchor.web3.Keypair.generate();
  const treasury = anchor.web3.Keypair.generate();
  const marketId = new anchor.BN(1);
  const gigId = new anchor.BN(1);

  const [marketPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("milestone_market"), marketId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );
  
  const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), marketPda.toBuffer()],
    program.programId
  );

  const [positionPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("position"), marketPda.toBuffer(), trader1.publicKey.toBuffer()],
    program.programId
  );

  before(async () => {
    const sig1 = await provider.connection.requestAirdrop(authority.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig1);
    
    const sig2 = await provider.connection.requestAirdrop(trader1.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig2);
  });

  it("Create milestone market", async () => {
    const deadline = new anchor.BN(Math.floor(Date.now() / 1000) + 86400);

    await program.methods
      .createMilestoneMarket(marketId, gigId, { milestoneVelocity: {} }, deadline)
      .accounts({
        market: marketPda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    const market = await program.account.milestoneMarket.fetch(marketPda);
    assert.equal(market.marketId.toNumber(), 1);
    assert.ok(Object.keys(market.marketType)[0] === 'milestoneVelocity');
  });

  it("Place YES/NO orders", async () => {
    const amount = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);
    const proof = Array.from(Buffer.alloc(64, 0));

    await program.methods
      .placePrivateOrderPer(true, amount, proof)
      .accounts({
        market: marketPda,
        vault: vaultPda,
        position: positionPda,
        trader: trader1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([trader1])
      .rpc();

    const market = await program.account.milestoneMarket.fetch(marketPda);
    assert.equal(market.yesPool.toString(), amount.toString());
    assert.equal(market.totalVolume.toString(), amount.toString());

    const position = await program.account.traderPosition.fetch(positionPda);
    assert.equal(position.yesShares.toString(), amount.toString());
  });

  it("Error: claim on unresolved market", async () => {
    try {
      await program.methods
        .claimPayout()
        .accounts({
          market: marketPda,
          vault: vaultPda,
          position: positionPda,
          treasury: treasury.publicKey,
          trader: trader1.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([trader1])
        .rpc();
      assert.fail("Should have failed");
    } catch (err: any) {
      assert.ok(err.message.includes("MarketNotResolved"));
    }
  });

  it("Resolve market", async () => {
    await program.methods
      .resolveMarket(true, null)
      .accounts({
        market: marketPda,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();

    const market = await program.account.milestoneMarket.fetch(marketPda);
    assert.ok(market.isResolved);
    assert.equal(market.winningOutcome, true);
  });

  it("Claim payout", async () => {
    const preBal = await provider.connection.getBalance(trader1.publicKey);
    
    await program.methods
      .claimPayout()
      .accounts({
        market: marketPda,
        vault: vaultPda,
        position: positionPda,
        treasury: treasury.publicKey,
        trader: trader1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([trader1])
      .rpc();

    const postBal = await provider.connection.getBalance(trader1.publicKey);
    assert.ok(postBal > preBal);
  });
  
});
