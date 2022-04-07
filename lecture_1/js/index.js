const {
  Connection,
  sendAndConfirmTransaction,
  Keypair,
  Transaction,
  SystemProgram,
  PublicKey,
  TransactionInstruction,
} = require("@solana/web3.js");

const BN = require("bn.js");

const main = async () => {
  var args = process.argv.slice(2);
  // args[0]: Program ID
  // args[1] (Optional): Counter buffer account
  const programId = new PublicKey(args[0]);

  console.log(programId.toBase58());  // Print programID to console
  const connection = new Connection("https://api.devnet.solana.com/");  // Connect to devnet
  const feePayer = new Keypair();  // Create new keypair to act as fee payer

  console.log("Requesting Airdrop of 1 SOL...");
  await connection.requestAirdrop(feePayer.publicKey, 2e9); // Request 2 SOL airdrop to fee payer for account creation
  console.log("Airdrop received");

  const counter = new Keypair();
  let counterKey = counter.publicKey;
  let tx = new Transaction();
  let signers = [feePayer];
  if (args.length > 1) {
    console.log("Found counter address");
    counterKey = new PublicKey(args[1]);
  } else {
    console.log("Generating new counter address");
    let createIx = SystemProgram.createAccount({
      fromPubkey: feePayer.publicKey,
      newAccountPubkey: counterKey,
      /** Amount of lamports to transfer to the created account */
      lamports: await connection.getMinimumBalanceForRentExemption(8),
      /** Amount of space in bytes to allocate to the created account */
      space: 8,
      /** Public key of the program to assign as the owner of the created account */
      programId: programId,
    });
    signers.push(counter);
    tx.add(createIx);  // Add account creation instruction
  }

  const idx = Buffer.from(new Uint8Array([0]));  // Instruction data. Enum zero is 'Increment'

  let incrIx = new TransactionInstruction({
    keys: [
      {
        pubkey: counterKey,
        isSigner: false,
        isWritable: true,
      },
    ],
    programId: programId,
    data: idx,  // Instruction data, for this case
  })
  /*
    TransactionInstruction({
      keys: Array<AccountMeta>,
      programId: PublicKey,
      data: Buffer,
    });
  */
  tx.add(incrIx); // Add increment instruction



  let txid = await sendAndConfirmTransaction(connection, tx, signers, {
    skipPreflight: true,
    preflightCommitment: "confirmed",
    confirmation: "confirmed",
  });
  console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);

  data = (await connection.getAccountInfo(counterKey)).data;
  count = new BN(data, "le");
  console.log("Counter Key:", counterKey.toBase58());
  console.log("Count: ", count.toNumber());
};

main()
  .then(() => {
    console.log("Success");
  })
  .catch((e) => {
    console.error(e);
  });
