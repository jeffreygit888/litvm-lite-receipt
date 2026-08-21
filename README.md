# LiteReceipt on LitVM LiteForge

LiteReceipt is a minimal Web3 receipt-proof dApp deployed on the LitVM LiteForge testnet.

It allows a user to hash a human-readable reference and optional metadata locally in the browser, store only those hashes on-chain, verify the receipt later, and revoke a receipt when needed.

## Live demo

https://jeffreygit888.github.io/litvm-lite-receipt/

## Network

- Network: LitVM LiteForge
- Chain ID: `4441`
- Current V2 contract: `0x2390d3B471d7c3597b7663281f73c2387889AA5E`
- Previous V1 contract: `0xD31BC2817c445335306a7812b114Aa7F9Cc4b3CE`

## V2 features

- Connect MetaMask
- Require LitVM LiteForge (Chain ID 4441)
- Create an on-chain receipt from a locally generated `bytes32` reference hash
- Optionally store a locally generated metadata hash
- Read the current receipt count
- Inspect receipt sender, hashes, timestamp, and status
- Verify a receipt by ID and original reference text
- Revoke an active receipt
- Only the original receipt creator can revoke that receipt
- Revoked receipts no longer verify as valid

## Contracts

Current source: [`contracts/LiteReceiptV2.sol`](contracts/LiteReceiptV2.sol)

V2 exposes:

- `createReceipt(bytes32 referenceHash, bytes32 metadataHash)`
- `revokeReceipt(uint256 receiptId)`
- `verifyReceipt(uint256 receiptId, bytes32 referenceHash)`
- `receiptCount()`
- `getReceipt(uint256 receiptId)`

The original reference and metadata text are not written to the blockchain. The frontend hashes them locally with `keccak256` and stores only the resulting hashes.

The original proof-of-concept contract remains available at [`contracts/LiteReceipt.sol`](contracts/LiteReceipt.sol).

## Frontend

The dApp is a static HTML/CSS/JavaScript frontend using ethers.js and MetaMask.

- `frontend/` contains the original local development frontend
- `docs/` contains the current GitHub Pages V2 deployment

The public V2 frontend performs gas estimation through the connected wallet RPC, applies a buffer, and then submits the transaction through MetaMask.

## Testnet validation

LiteReceipt V2 has been tested end-to-end on LitVM LiteForge using Remix, MetaMask, and the public GitHub Pages dApp.

Validated flows include:

1. V2 smart contract deployment to Chain ID 4441
2. `createReceipt` from Remix
3. `getReceipt` and `verifyReceipt` reads
4. `revokeReceipt` and post-revocation verification
5. Public MetaMask interaction through GitHub Pages
6. Dynamic gas estimation for public write transactions

### Public V2 create transaction

- Block: `42339881`
- Transaction: `0x99997b4563abf080f19ed6648962c92d4157efb231e95b52197bed3254e6adea`
- Estimated/buffered gas limit used by the frontend: `196405`
- Receipt count after confirmation: `2`

### Public V2 revoke transaction

- Block: `42340261`
- Transaction: `0x460c0521f7176672dfb635026134fe277102ab41b309a57b319614fdaca2401f`
- Receipt ID `2` was successfully revoked
- Verification after revocation returned `false` with status `Revoked`

## Builder progress

LiteReceipt started as a simple reference-hash proof-of-concept and was upgraded during LiteForge testing to V2 with metadata hashing, explicit receipt status, creator-only revocation, public inspection, and a more robust wallet/RPC transaction flow.

The project has been submitted to the LitVM Builders Program and is being maintained as a small payments-oriented testnet project.

## LiteForge feedback

The EVM-compatible environment allowed standard Solidity tooling such as Remix, MetaMask, and ethers.js to be used successfully.

During public dApp testing, fixed-gas and standard library transaction submission produced failed interactions on the custom network. The frontend was adjusted to call `eth_estimateGas`, add a safety buffer, and then submit through MetaMask. That flow successfully confirmed the V2 create and revoke transactions. This is useful integration feedback for builder tooling on LiteForge.

## Security / scope

This is a testnet demonstration project, not production payment infrastructure. A production system would need additional issuer authentication, authorization, replay protections, typed/signature-based data, indexing, application-level validation, and an appropriate trust and settlement model.

## License

MIT
