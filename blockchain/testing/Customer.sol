// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import './MedicineD_C.sol';
import './Medicine.sol';

contract Customer {
    struct Purchase {
        address medicineAddress;
        address buyer;
        uint256 quantity;
        uint256 timestamp;
    }

    mapping(address => address[]) public MedicineBatchAtCustomer;
    mapping(address => salestatus) public sale;
    mapping(address => Purchase[]) public purchaseHistory;

    enum salestatus {
        notfound,
        atcustomer,
        sold,
        expired,
        damaged
    }

    event MedicinePurchased(
        address indexed medicineAddress,
        address indexed buyer,
        uint256 quantity,
        uint256 timestamp
    );

    event MedicineStatus(
        address _address,
        address indexed Customer,
        uint status
    );

    event OrderPlaced(
        bytes32 indexed orderId,
        address indexed buyer,
        uint256 amount,
        uint256 timestamp
    );

    function medicineRecievedAtCustomer(
        address _address,
        address cid
    ) public {
        MedicineD_C(cid).receiveDC(_address, msg.sender);
        MedicineBatchAtCustomer[msg.sender].push(_address);
        sale[_address] = salestatus(1);
    }

    function updateSaleStatus(
        address _address,
        uint Status
    ) public {
        sale[_address] = salestatus(Status);

        if(Status == 2) {
            Medicine med = Medicine(_address);
            uint256 quantity = med.quantity();
            purchaseHistory[msg.sender].push(Purchase({
                medicineAddress: _address,
                buyer: msg.sender,
                quantity: quantity,
                timestamp: block.timestamp
            }));
            emit MedicinePurchased(
                _address,
                msg.sender,
                quantity,
                block.timestamp
            );
        }

        emit MedicineStatus(_address, msg.sender, Status);
    }

    function salesInfo(
        address _address
    ) public
    view
    returns(
        uint Status
    ){
        return uint(sale[_address]);
    }

    function getPurchaseHistory(address buyer) public view returns (Purchase[] memory) {
        return purchaseHistory[buyer];
    }

    function placeOrder(
        bytes32 orderId,
        address buyer,
        uint256 amount
    ) public {
        emit OrderPlaced(
            orderId,
            buyer,
            amount,
            block.timestamp
        );
    }
}