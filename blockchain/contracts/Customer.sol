// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

import './MedicineD_C.sol';
import './Medicine.sol';

contract Customer {
    
    mapping(address => address[]) public MedicineBatchAtCustomer;
    mapping(address => salestatus) public sale;

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
        
        // Capture purchase data when marked as sold (status 2)
        if(Status == 2) {
            Medicine med = Medicine(_address);
            emit MedicinePurchased(
                _address,
                msg.sender,
                med.quantity(), // Get quantity from Medicine contract
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

}