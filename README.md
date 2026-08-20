# LiteReceipt on LitVM LiteForge

LiteReceipt is a minimal Web3 receipt-proof dApp deployed on the LitVM LiteForge testnet.

It allows a user to hash a human-readable reference locally in the browser, store that hash on-chain, and later verify whether a receipt ID matches the same reference.

## Live demo

https://jeffreygit888.github.io/litvm-lite-receipt/

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
- `docs/` contains the GitHub Pages deployment

To test locally:

```bash
cd frontend
python -m http.server 8080
```

Then open `http://localhost:8080` with MetaMask connected to LitVM LiteForge.

## Testnet deployment

LiteReceipt is deployed and operational on LitVM LiteForge. The deployment has been tested end-to-end through both Remix and the public dApp:

1. Smart contract deployment to Chain ID 4441
2. `createReceipt` write transaction
3. `receiptCount` and `receipts` reads
4. Public MetaMask interaction through GitHub Pages
5. Receipt verification returning a valid on-chain match

## Builder intent

LiteReceipt is a small payments-oriented proof-of-concept exploring how application references or receipt identifiers can be anchored on-chain without publishing the original reference text itself.

The project is intentionally minimal for the LiteForge testnet. Possible next steps include authenticated issuers, typed receipt metadata, payment settlement references, revocation/status handling, signatures, and production-grade indexing.

## Feedback from LiteForge testing

The EVM-compatible workflow made it possible to deploy a Solidity contract and interact with it using standard tooling such as Remix, MetaMask, and ethers.js. The project was also successfully served as a static dApp through GitHub Pages and connected to the deployed LiteForge contract.

## Security / scope

This is a testnet demonstration project, not production payment infrastructure. Do not use it as proof of settlement without additional authentication, authorization, replay protection, application-level validation, and an appropriate trust model.

## License

MIT
