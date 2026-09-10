import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { FlintReputation } from "../target/types/flint_reputation";
import { assert } from "chai";

describe("flint-reputation", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.FlintReputation as Program<FlintReputation>;

  const builder = anchor.web3.Keypair.generate();
  const authority = anchor.web3.Keypair.generate(); // simulates CPI authority

  const [passportPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("builder_passport"), builder.publicKey.toBuffer()],
    program.programId
  );

  before(async () => {
    const sig1 = await provider.connection.requestAirdrop(builder.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig1);
    
    const sig2 = await provider.connection.requestAirdrop(authority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig2);
  });

  it("Initialize passport", async () => {
    await program.methods
      .initializePassport()
      .accounts({
        passport: passportPda,
        builder: builder.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([builder])
      .rpc();

    const passport = await program.account.builderPassport.fetch(passportPda);
    assert.equal(passport.socialReliabilityScore, 100);
    assert.equal(passport.totalGigsCompleted, 0);
  });

  it("Record gig completion", async () => {
    const gigId = new anchor.BN(1);
    const amount = new anchor.BN(1000);
    
    const [sbtPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("sbt_record"), builder.publicKey.toBuffer(), gigId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Mock core_program and asset for simplicity
    const dummyAsset = anchor.web3.Keypair.generate().publicKey;
    
    await program.methods
      .recordGigCompletionSbt(gigId, amount, true)
      .accounts({
        passport: passportPda,
        sbtRecord: sbtPda,
        asset: dummyAsset,
        authority: authority.publicKey,
        coreProgram: anchor.web3.SystemProgram.programId, // Mock
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    const passport = await program.account.builderPassport.fetch(passportPda);
    assert.equal(passport.totalGigsCompleted, 1);
    assert.equal(passport.onTimeDeliveries, 1);
    assert.equal(passport.socialReliabilityScore, 100);
    assert.equal(passport.sbtMintedCount, 1);
  });

  it("Error: unauthorized minting", async () => {
    const gigId = new anchor.BN(2);
    const amount = new anchor.BN(1000);
    
    const [sbtPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("sbt_record"), builder.publicKey.toBuffer(), gigId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const dummyAsset = anchor.web3.Keypair.generate().publicKey;

    try {
      await program.methods
        .recordGigCompletionSbt(gigId, amount, true)
        .accounts({
          passport: passportPda,
          sbtRecord: sbtPda,
          asset: dummyAsset,
          authority: builder.publicKey, // Builder tries to self-mint
          coreProgram: anchor.web3.SystemProgram.programId,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([builder])
        .rpc();
      assert.fail("Should have failed");
    } catch (err: any) {
      assert.ok(err.message.includes("Unauthorized"));
    }
  });

});
