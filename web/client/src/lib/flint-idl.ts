export const FlintMarketIDL = {
  "version": "0.1.0",
  "name": "flint_market",
  "instructions": [
    {
      "name": "placePrivateOrderPer",
      "accounts": [
        { "name": "market", "isMut": true, "isSigner": false },
        { "name": "position", "isMut": true, "isSigner": false },
        { "name": "trader", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "isYes", "type": "bool" },
        { "name": "amount", "type": "u64" },
        { "name": "encryptedPositionProof", "type": { "array": [ "u8", 64 ] } }
      ]
    }
  ]
};
