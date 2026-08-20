// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LiteReceipt {
    struct Receipt {
        address sender;
        bytes32 referenceHash;
        uint256 timestamp;
    }

    mapping(uint256 => Receipt) public receipts;
    uint256 public receiptCount;

    event ReceiptCreated(
        uint256 indexed receiptId,
        address indexed sender,
        bytes32 referenceHash,
        uint256 timestamp
    );

    function createReceipt(bytes32 referenceHash) external returns (uint256) {
        receiptCount++;

        receipts[receiptCount] = Receipt({
            sender: msg.sender,
            referenceHash: referenceHash,
            timestamp: block.timestamp
        });

        emit ReceiptCreated(
            receiptCount,
            msg.sender,
            referenceHash,
            block.timestamp
        );

        return receiptCount;
    }

    function verifyReceipt(
        uint256 receiptId,
        bytes32 referenceHash
    ) external view returns (bool) {
        return receipts[receiptId].referenceHash == referenceHash;
    }
}
