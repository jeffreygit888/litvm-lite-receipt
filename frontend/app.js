const CONTRACT_ADDRESS = "0xD31BC2817c445335306a7812b114Aa7F9Cc4b3CE";
const LITEFORGE_CHAIN_ID = 4441n;

const ABI = [
  "function createReceipt(bytes32 referenceHash) external returns (uint256)",
  "function verifyReceipt(uint256 receiptId, bytes32 referenceHash) external view returns (bool)",
  "function receiptCount() external view returns (uint256)",
  "function receipts(uint256) external view returns (address sender, bytes32 referenceHash, uint256 timestamp)",
  "event ReceiptCreated(uint256 indexed receiptId, address indexed sender, bytes32 referenceHash, uint256 timestamp)"
];

let provider;
let signer;
let contract;

const connectBtn = document.getElementById("connectBtn");
const createBtn = document.getElementById("createBtn");
const verifyBtn = document.getElementById("verifyBtn");
const walletStatus = document.getElementById("walletStatus");
const createResult = document.getElementById("createResult");
const verifyResult = document.getElementById("verifyResult");

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
  } catch (error) {
    walletStatus.textContent = error.message;
  }
}

async function createReceipt() {
  const reference = document.getElementById("referenceInput").value.trim();
  if (!reference) return;

  try {
    await ensureLiteForge();
    createBtn.disabled = true;
    createResult.textContent = "Waiting for MetaMask confirmation...";

    const referenceHash = ethers.keccak256(ethers.toUtf8Bytes(reference));
    const tx = await contract.createReceipt(referenceHash);
    createResult.textContent = `Submitted: ${tx.hash}\nWaiting for confirmation...`;

    const receipt = await tx.wait();
    const count = await contract.receiptCount();
    createResult.textContent = `Confirmed in block ${receipt.blockNumber}\nTx: ${tx.hash}\nReference hash: ${referenceHash}\nCurrent receipt count: ${count}`;
  } catch (error) {
    createResult.textContent = error.shortMessage || error.message;
  } finally {
    createBtn.disabled = false;
  }
}

async function verifyReceipt() {
  const receiptId = document.getElementById("receiptIdInput").value.trim();
  const reference = document.getElementById("verifyReferenceInput").value.trim();
  if (!receiptId || !reference) return;

  try {
    await ensureLiteForge();
    const referenceHash = ethers.keccak256(ethers.toUtf8Bytes(reference));
    const valid = await contract.verifyReceipt(receiptId, referenceHash);
    const stored = await contract.receipts(receiptId);

    const date = new Date(Number(stored.timestamp) * 1000);
    verifyResult.textContent = [
      `Valid: ${valid}`,
      `Sender: ${stored.sender}`,
      `Stored hash: ${stored.referenceHash}`,
      `Timestamp: ${date.toISOString()}`
    ].join("\n");
  } catch (error) {
    verifyResult.textContent = error.shortMessage || error.message;
  }
}

connectBtn.addEventListener("click", connectWallet);
createBtn.addEventListener("click", createReceipt);
verifyBtn.addEventListener("click", verifyReceipt);

if (window.ethereum) {
  window.ethereum.on("chainChanged", () => window.location.reload());
  window.ethereum.on("accountsChanged", () => window.location.reload());
}
