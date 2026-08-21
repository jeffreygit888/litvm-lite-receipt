const CONTRACT_ADDRESS = "0x2390d3B471d7c3597b7663281f73c2387889AA5E";
const LITEFORGE_CHAIN_ID = 4441n;

const ABI = [
  "function createReceipt(bytes32 referenceHash, bytes32 metadataHash) external returns (uint256)",
  "function revokeReceipt(uint256 receiptId) external",
  "function verifyReceipt(uint256 receiptId, bytes32 referenceHash) external view returns (bool)",
  "function receiptCount() external view returns (uint256)",
  "function getReceipt(uint256 receiptId) external view returns (address sender, bytes32 referenceHash, bytes32 metadataHash, uint256 timestamp, uint8 status)",
  "event ReceiptCreated(uint256 indexed receiptId, address indexed sender, bytes32 referenceHash, bytes32 metadataHash, uint256 timestamp)",
  "event ReceiptRevoked(uint256 indexed receiptId, address indexed sender, uint256 timestamp)"
];

let provider;
let signer;
let contract;

const connectBtn = document.getElementById("connectBtn");
const createBtn = document.getElementById("createBtn");
const verifyBtn = document.getElementById("verifyBtn");
const inspectBtn = document.getElementById("inspectBtn");
const revokeBtn = document.getElementById("revokeBtn");
const walletStatus = document.getElementById("walletStatus");
const createResult = document.getElementById("createResult");
const verifyResult = document.getElementById("verifyResult");
const inspectResult = document.getElementById("inspectResult");
const revokeResult = document.getElementById("revokeResult");

function statusText(status) {
  const n = Number(status);
  if (n === 1) return "Active";
  if (n === 2) return "Revoked";
  return "None";
}

async function ensureLiteForge() {
  const network = await provider.getNetwork();
  if (network.chainId !== LITEFORGE_CHAIN_ID) {
    throw new Error(`Wrong network. Switch MetaMask to LitVM LiteForge (Chain ID 4441). Current: ${network.chainId}`);
  }
}

async function connectWallet() {
  try {
    if (!window.ethereum) throw new Error("MetaMask was not detected.");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.BrowserProvider(window.ethereum);
    await ensureLiteForge();
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    const address = await signer.getAddress();
    walletStatus.textContent = `Connected: ${address}`;
    connectBtn.textContent = "Wallet Connected";
    createBtn.disabled = false;
    verifyBtn.disabled = false;
    inspectBtn.disabled = false;
    revokeBtn.disabled = false;
  } catch (error) {
    walletStatus.textContent = error.shortMessage || error.message;
  }
}

async function createReceipt() {
  const reference = document.getElementById("referenceInput").value.trim();
  const metadata = document.getElementById("metadataInput").value.trim();
  if (!reference) {
    createResult.textContent = "Reference text is required.";
    return;
  }

  try {
    await ensureLiteForge();
    createBtn.disabled = true;
    createResult.textContent = "Waiting for MetaMask confirmation...";

    const referenceHash = ethers.keccak256(ethers.toUtf8Bytes(reference));
    const metadataHash = metadata
      ? ethers.keccak256(ethers.toUtf8Bytes(metadata))
      : ethers.ZeroHash;

    const tx = await contract.createReceipt(referenceHash, metadataHash);
    createResult.textContent = `Submitted: ${tx.hash}\nWaiting for confirmation...`;

    const receipt = await tx.wait();
    const count = await contract.receiptCount();
    createResult.textContent = [
      `Confirmed in block ${receipt.blockNumber}`,
      `Tx: ${tx.hash}`,
      `Reference hash: ${referenceHash}`,
      `Metadata hash: ${metadataHash}`,
      `Current receipt count: ${count}`
    ].join("\n");
  } catch (error) {
    createResult.textContent = error.shortMessage || error.message;
  } finally {
    createBtn.disabled = false;
  }
}

async function verifyReceipt() {
  const receiptId = document.getElementById("receiptIdInput").value.trim();
  const reference = document.getElementById("verifyReferenceInput").value.trim();
  if (!receiptId || !reference) {
    verifyResult.textContent = "Receipt ID and reference text are required.";
    return;
  }

  try {
    await ensureLiteForge();
    const referenceHash = ethers.keccak256(ethers.toUtf8Bytes(reference));
    const valid = await contract.verifyReceipt(receiptId, referenceHash);
    const stored = await contract.getReceipt(receiptId);
    const date = new Date(Number(stored.timestamp) * 1000);

    verifyResult.textContent = [
      `Valid: ${valid}`,
      `Status: ${statusText(stored.status)}`,
      `Sender: ${stored.sender}`,
      `Stored reference hash: ${stored.referenceHash}`,
      `Metadata hash: ${stored.metadataHash}`,
      `Timestamp: ${date.toISOString()}`
    ].join("\n");
  } catch (error) {
    verifyResult.textContent = error.shortMessage || error.message;
  }
}

async function inspectReceipt() {
  const receiptId = document.getElementById("inspectIdInput").value.trim();
  if (!receiptId) {
    inspectResult.textContent = "Receipt ID is required.";
    return;
  }

  try {
    await ensureLiteForge();
    const stored = await contract.getReceipt(receiptId);
    const date = new Date(Number(stored.timestamp) * 1000);
    inspectResult.textContent = [
      `Receipt ID: ${receiptId}`,
      `Status: ${statusText(stored.status)}`,
      `Sender: ${stored.sender}`,
      `Reference hash: ${stored.referenceHash}`,
      `Metadata hash: ${stored.metadataHash}`,
      `Timestamp: ${date.toISOString()}`
    ].join("\n");
  } catch (error) {
    inspectResult.textContent = error.shortMessage || error.message;
  }
}

async function revokeReceipt() {
  const receiptId = document.getElementById("revokeIdInput").value.trim();
  if (!receiptId) {
    revokeResult.textContent = "Receipt ID is required.";
    return;
  }

  try {
    await ensureLiteForge();
    revokeBtn.disabled = true;
    revokeResult.textContent = "Waiting for MetaMask confirmation...";
    const tx = await contract.revokeReceipt(receiptId);
    revokeResult.textContent = `Submitted: ${tx.hash}\nWaiting for confirmation...`;
    const receipt = await tx.wait();
    revokeResult.textContent = `Receipt ${receiptId} revoked in block ${receipt.blockNumber}\nTx: ${tx.hash}`;
  } catch (error) {
    revokeResult.textContent = error.shortMessage || error.message;
  } finally {
    revokeBtn.disabled = false;
  }
}

connectBtn.addEventListener("click", connectWallet);
createBtn.addEventListener("click", createReceipt);
verifyBtn.addEventListener("click", verifyReceipt);
inspectBtn.addEventListener("click", inspectReceipt);
revokeBtn.addEventListener("click", revokeReceipt);

if (window.ethereum) {
  window.ethereum.on("chainChanged", () => window.location.reload());
  window.ethereum.on("accountsChanged", () => window.location.reload());
}
