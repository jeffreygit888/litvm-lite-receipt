const CONTRACT_ADDRESS = "0x2390d3B471d7c3597b7663281f73c2387889AA5E";
const LITEFORGE_CHAIN_ID = 4441n;

const ABI = [
  "function createReceipt(bytes32 referenceHash, bytes32 metadataHash) external returns (uint256)",
  "function revokeReceipt(uint256 receiptId) external",
  "function verifyReceipt(uint256 receiptId, bytes32 referenceHash) external view returns (bool)",
  "function receiptCount() external view returns (uint256)",
  "function getReceipt(uint256 receiptId) external view returns (address sender, bytes32 referenceHash, bytes32 metadataHash, uint256 timestamp, uint8 status)"
];

let provider;
let signer;
let contract;
let connectedAddress;
const iface = new ethers.Interface(ABI);

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

function readableError(error) {
  return error?.shortMessage || error?.info?.error?.message || error?.data?.message || error?.message || JSON.stringify(error);
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
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    connectedAddress = accounts[0];
    provider = new ethers.BrowserProvider(window.ethereum);
    await ensureLiteForge();
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    walletStatus.textContent = `Connected: ${connectedAddress}`;
    connectBtn.textContent = "Wallet Connected";
    createBtn.disabled = false;
    verifyBtn.disabled = false;
    inspectBtn.disabled = false;
    revokeBtn.disabled = false;
  } catch (error) {
    walletStatus.textContent = readableError(error);
  }
}

async function sendViaMetaMask(data) {
  await ensureLiteForge();
  const txHash = await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [{
      from: connectedAddress,
      to: CONTRACT_ADDRESS,
      data,
      value: "0x0",
      gas: "0x493E0"
    }]
  });
  return txHash;
}

async function createReceipt() {
  const reference = document.getElementById("referenceInput").value.trim();
  const metadata = document.getElementById("metadataInput").value.trim();
  if (!reference) {
    createResult.textContent = "Reference text is required.";
    return;
  }

  try {
    createBtn.disabled = true;
    createResult.textContent = "Waiting for MetaMask confirmation...";

    const referenceHash = ethers.keccak256(ethers.toUtf8Bytes(reference));
    const metadataHash = metadata ? ethers.keccak256(ethers.toUtf8Bytes(metadata)) : ethers.ZeroHash;
    const data = iface.encodeFunctionData("createReceipt", [referenceHash, metadataHash]);
    const txHash = await sendViaMetaMask(data);

    createResult.textContent = `Submitted: ${txHash}\nWaiting for confirmation...`;
    const receipt = await provider.waitForTransaction(txHash);
    const count = await contract.receiptCount();

    createResult.textContent = [
      `Confirmed in block ${receipt.blockNumber}`,
      `Tx: ${txHash}`,
      `Reference hash: ${referenceHash}`,
      `Metadata hash: ${metadataHash}`,
      `Current receipt count: ${count}`
    ].join("\n");
  } catch (error) {
    console.error(error);
    createResult.textContent = readableError(error);
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
    verifyResult.textContent = readableError(error);
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
    inspectResult.textContent = readableError(error);
  }
}

async function revokeReceipt() {
  const receiptId = document.getElementById("revokeIdInput").value.trim();
  if (!receiptId) {
    revokeResult.textContent = "Receipt ID is required.";
    return;
  }

  try {
    revokeBtn.disabled = true;
    revokeResult.textContent = "Waiting for MetaMask confirmation...";
    const data = iface.encodeFunctionData("revokeReceipt", [receiptId]);
    const txHash = await sendViaMetaMask(data);
    revokeResult.textContent = `Submitted: ${txHash}\nWaiting for confirmation...`;
    const receipt = await provider.waitForTransaction(txHash);
    revokeResult.textContent = `Receipt ${receiptId} revoked in block ${receipt.blockNumber}\nTx: ${txHash}`;
  } catch (error) {
    console.error(error);
    revokeResult.textContent = readableError(error);
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
