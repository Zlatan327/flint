import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { FlintEscrow } from "../target/types/flint_escrow";
import { assert } from "chai";

describe("flint-escrow", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.FlintEscrow as Program<FlintEscrow>;

  const client = anchor.web3.Keypair.generate();
  const freelancer = anchor.web3.Keypair.generate();
  const treasury = anchor.web3.Keypair.generate();
  const gigId = new anchor.BN(1);

  // Derive PDAs
  const [gigEscrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("gig_escrow"), gigId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );
  const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), gigEscrowPda.toBuffer()],
    program.programId
  );

  before(async () => {
    // Airdrop
    const sig = await provider.connection.requestAirdrop(client.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig);
  });

  it("Initialize a gig", async () => {
    const totalAmount = new anchor.BN(5 * anchor.web3.LAMPORTS_PER_SOL);
    const deadline = new anchor.BN(Math.floor(Date.now() / 1000) + 86400);

    await program.methods
      .initializeGig(gigId, totalAmount, 3, deadline, 0)
      .accounts({
        gigEscrow: gigEscrowPda,
        client: client.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([client])
      .rpc();

    const gigAccount = await program.account.gigEscrow.fetch(gigEscrowPda);
    assert.ok(gigAccount.client.equals(client.publicKey));
    assert.equal(gigAccount.gigId.toNumber(), 1);
    assert.equal(gigAccount.totalAmount.toString(), totalAmount.toString());
    assert.equal(gigAccount.milestonesCount, 3);
    assert.ok(Object.keys(gigAccount.status)[0] === 'initialized');
  });

  it("Deposit escrow", async () => {
    const amount = new anchor.BN(5 * anchor.web3.LAMPORTS_PER_SOL);

    await program.methods
      .depositEscrow(amount)
      .accounts({
        gigEscrow: gigEscrowPda,
        vault: vaultPda,
        client: client.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([client])
      .rpc();

    const gigAccount = await program.account.gigEscrow.fetch(gigEscrowPda);
    assert.ok(Object.keys(gigAccount.status)[0] === 'funded');
    
    const vaultBalance = await provider.connection.getBalance(vaultPda);
    assert.equal(vaultBalance, amount.toNumber());
  });

  it("Assign freelancer / claim bounty", async () => {
    await program.methods
      .claimBounty()
      .accounts({
        gigEscrow: gigEscrowPda,
        freelancer: freelancer.publicKey,
      })
      .signers([freelancer])
      .rpc();

    const gigAccount = await program.account.gigEscrow.fetch(gigEscrowPda);
    assert.ok(gigAccount.isFreelancerAssigned);
    assert.ok(gigAccount.freelancer.equals(freelancer.publicKey));
    assert.ok(Object.keys(gigAccount.status)[0] === 'inProgress');
  });

  it("Submit work", async () => {
    const deliverableHash = Array.from(Buffer.alloc(32, 1));
    await program.methods
      .submitWork(deliverableHash)
      .accounts({
        gigEscrow: gigEscrowPda,
        freelancer: freelancer.publicKey,
      })
      .signers([freelancer])
      .rpc();

    const gigAccount = await program.account.gigEscrow.fetch(gigEscrowPda);
    assert.deepEqual(gigAccount.deliverableHash, deliverableHash);
    assert.ok(Object.keys(gigAccount.status)[0] === 'reviewing');
  });

  it("Cannot settle before all milestones", async () => {
    try {
      await program.methods
        .commitAndSettleEscrow()
        .accounts({
          gigEscrow: gigEscrowPda,
          vault: vaultPda,
          freelancer: freelancer.publicKey,
          treasury: treasury.publicKey,
          signer: client.publicKey,
          builderPassport: anchor.web3.SystemProgram.programId, // empty for now
          sbtRecord: anchor.web3.SystemProgram.programId,
          coreAsset: anchor.web3.SystemProgram.programId,
          coreProgram: anchor.web3.SystemProgram.programId,
          flintReputationProgram: anchor.web3.SystemProgram.programId,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([client])
        .rpc();
      assert.fail("Should have failed");
    } catch (err: any) {
      assert.ok(err.message.includes("NotReadyForSettlement") || err.message.includes("Custom"));
    }
  });

});
