// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LiteReceiptV2 {
    enum Status {
        None,
        Active,
        Revoked
    }

    struct Receipt {
        address sender;
        bytes32 referenceHash;
        bytes32 metadataHash;
        uint256 timestamp;
        Status status;
    }

    mapping(uint256 => Receipt) public receipts;
    uint256 public receiptCount;

    event ReceiptCreated(
        uint256 indexed receiptId,
        address indexed sender,
        bytes32 referenceHash,
        bytes32 metadataHash,
        uint256 timestamp
    );

    event ReceiptRevoked(
        uint256 indexed receiptId,
        address indexed sender,
        uint256 timestamp
    );

    function createReceipt(
        bytes32 referenceHash,
        bytes32 metadataHash
    ) external returns (uint256) {
        require(referenceHash != bytes32(0), "Reference hash required");

        receiptCount++;

        receipts[receiptCount] = Receipt({
            sender: msg.sender,
            referenceHash: referenceHash,
            metadataHash: metadataHash,
            timestamp: block.timestamp,
            status: Status.Active
        });

        emit ReceiptCreated(
            receiptCount,
            msg.sender,
            referenceHash,
            metadataHash,
            block.timestamp
        );

        return receiptCount;
    }

    function revokeReceipt(uint256 receiptId) external {
        Receipt storage receipt = receipts[receiptId];

        require(receipt.status == Status.Active, "Receipt not active");
        require(receipt.sender == msg.sender, "Only creator can revoke");

        receipt.status = Status.Revoked;

        emit ReceiptRevoked(receiptId, msg.sender, block.timestamp);
    }

    function verifyReceipt(
        uint256 receiptId,
        bytes32 referenceHash
    ) external view returns (bool) {
        Receipt memory receipt = receipts[receiptId];

        return
            receipt.status == Status.Active &&
            receipt.referenceHash == referenceHash;
    }

    function getReceipt(uint256 receiptId)
        external
        view
        returns (
            address sender,
            bytes32 referenceHash,
            bytes32 metadataHash,
            uint256 timestamp,
            Status status
        )
    {
        Receipt memory receipt = receipts[receiptId];
        require(receipt.status != Status.None, "Receipt not found");

        return (
            receipt.sender,
            receipt.referenceHash,
            receipt.metadataHash,
            receipt.timestamp,
            receipt.status
        );
    }
}
