# LiteReceipt on LitVM LiteForge

LiteReceipt is a minimal Web3 receipt-proof dApp deployed on the LitVM LiteForge testnet.

It allows a user to hash a human-readable reference locally in the browser, store that hash on-chain, and later verify whether a receipt ID matches the same reference.

## Network

- Network: LitVM LiteForge
- Chain ID: `4441`
- Contract: `0xD31BC2817c445335306a7812b114Aa7F9Cc4b3CE`

## Features

- Connect MetaMask
- Require LitVM LiteForge (Chain ID 4441)
- Create an on-chain receipt from a locally generated `bytes32` hash
- Read the current receipt count
- Verify a receipt by ID and reference text
- Read the original sender, stored hash, and timestamp

## Contract

Source: [`contracts/LiteReceipt.sol`](contracts/LiteReceipt.sol)

The contract exposes:

- `createReceipt(bytes32 referenceHash)`
- `verifyReceipt(uint256 receiptId, bytes32 referenceHash)`
- `receiptCount()`
- `receipts(uint256 receiptId)`

The reference text itself is not written to the blockchain. The frontend hashes it locally with `keccak256` and only stores the hash.

## Frontend

The dApp is a static HTML/CSS/JavaScript frontend using ethers.js.

Files:

- `frontend/index.html`
- `frontend/app.js`
- `frontend/style.css`

To test locally, serve the `frontend` directory with any static HTTP server, then open it in a browser with MetaMask installed and connected to LitVM LiteForge.

Example using Python:

```bash
cd frontend
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Testnet deployment

The current LiteReceipt deployment was created on LitVM LiteForge and has already been used to create an initial receipt transaction.

This repository is intended as a small LitVM builder/testnet project demonstrating contract deployment, wallet interaction, writes, and reads on Chain ID 4441.

## Security / scope

This is a testnet demonstration project, not production payment infrastructure. Do not use it as proof of settlement without additional authentication, authorization, replay protection, application-level validation, and an appropriate trust model.

## License

MIT
