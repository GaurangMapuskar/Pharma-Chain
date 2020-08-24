pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;


import './Manufacturer.sol';
import './Distributor.sol';
import './Customer.sol';
import './Product.sol';



//// New supply chain : supplier -> transporter -> manufacturer -> transporter -> whole-saler -> transporter -> distributor -> transporter -> customer/hospital/pharmacy


contract SupplyChain is Manufacturer, Distributor, Customer {
    
    address Owner;
    
    struct location {
        string latitude;
        string longitude;
    }
    
    struct orders {
        bool isUidGenerated;
        address itemid;
        string itemname;
        string transitstatus;
        uint orderstatus; /// 1 -> Order Recieved, 2 -> Confirmed, 3 -> Order Shipped, 4 -> Order Delivered, 5 -> Order Cancelled
        address customer;
        uint ordertime;
        uint deliverytime;
        uint quantity;
        address manufacturerAddress;
        uint distributorCount;
        location[] locationsArr;
        bytes32 uniqueHash;
    }
    
    mapping (address => orders) public orderMap;
    mapping (address => mapping (uint => address)) public carriers;
    
    
    constructor() public {
        Owner = msg.sender;
    }
    
    
    modifier onlyOwner() {
        require(Owner == msg.sender);
        _;
    }
    
    
    modifier checkUser(address addr) {
        require(addr == msg.sender);
        _;
    }
    
    enum roles {
        noRole,
        supplier,
        transporter,
        manufacturer,
        wholesaler,
        distributor,
        customer
    }
    
    
    //////////////// Events ////////////////////
    
    event UserRegister(address indexed _address, bytes32 name);
    event UpdateRole(bytes32 result);
    
    
    /////////////// Users //////////////////////
    
    struct userData {
        bytes32 name;
        uint[] userLoc;
        roles role;
        address userAddr
    }
    
    mapping (address => userData) public userInfo;
    
    function registerUser(bytes32 name, uint[] loc, roles role, address _userAddr) onlyOwner {
        userInfo[_userAddr].name = name;
        userInfo[_userAddr].userLoc = loc;
        userInfo[_userAddr].role = role;
        userInfo[_userAddr].userAddr = _userAddr;
        
        emit UserRegister(_userAddr, name);
    }
    
    function changeUserRole(Role _role, address _address) onlyOwner {
        userInfo[_address].role = _role;
        bytes32 result = "Role Updated!";
        emit UpdateRole(result);
    }
    
    function getUserInfo(address _address) public view returns(
        bytes32 name,
        unit[] location,
        address ethAddress,
        roles role
        ) {
        return (
            userInfo[_address].name,
            userInfo[_address].userLoc,
            userInfo[_address].userAddr,
            userInfo[_address].role
        );
    }
    
    
    /////////////// Users //////////////////////

    
    function orderItem(address _itemId, uint _quantity, string memory _itemname, address _manufacturerAddress) public returns(address) {
        address orderId = address(bytes20(sha256(abi.encodePacked(msg.sender, now))));
        
        orderMap[orderId].isUidGenerated = true;
        orderMap[orderId].itemid = _itemId;
        orderMap[orderId].quantity = _quantity;
        orderMap[orderId].itemname = _itemname;
        orderMap[orderId].transitstatus = "Your order is recieved!";
        orderMap[orderId].orderstatus = 1;
        orderMap[orderId].customer = msg.sender;
        orderMap[orderId].ordertime = now;
        orderMap[orderId].manufacturerAddress = _manufacturerAddress;
        // orderMap[orderId].uniqueHash = sha256(abi.encodePacked())
        
        productMap[_itemId].quantityMg -= _quantity;
        customerOrders[msg.sender][customerMap[msg.sender].ordersCount] = orderId;
        customerMap[msg.sender].ordersCount += 1;

        return orderId;
    }
    
    
    function confirmOrder(address _orderId, string memory _latitude, string memory _longitude) public checkUser(orderMap[_orderId].manufacturerAddress) returns(string memory){
        require(orderMap[_orderId].orderstatus == 1);
        
        orderMap[_orderId].orderstatus = 2;
        orderMap[_orderId].transitstatus = "Order Confirmed";
        orderMap[_orderId].distributorCount = 1;
        orderMap[_orderId].locationsArr.push(location(_latitude, _longitude));
        
        carriers[_orderId][0] = msg.sender; 
            
        return 'Order Confirmed!';
    }



    function transferOwnershipOfOrder(address _orderId, address _nextDistributor) public checkUser(carriers[_orderId][orderMap[_orderId].distributorCount - 1]) returns(string memory) {
        require(orderMap[_orderId].orderstatus < 4);
        
        carriers[_orderId][orderMap[_orderId].distributorCount] = _nextDistributor;
        orderMap[_orderId].distributorCount += 1;
        
        if (orderMap[_orderId].customer == _nextDistributor){
            orderMap[_orderId].orderstatus = 4;
            orderMap[_orderId].transitstatus = 'Order Delivered!';
            orderMap[_orderId].deliverytime = now;
        }else{
            orderMap[_orderId].orderstatus = 3;
            orderMap[_orderId].transitstatus = 'Order in transit!';
        }
        
        return 'Distributor added for product!';
    }
    
    
    function ownerCreateManufacturer(address _addr, string memory _name, string memory _addressName) public onlyOwner returns(string memory) {
        createManufacturer(_addr, _name, _addressName);
        
        return 'Manufacturer created successfully!';
    }
    
    
    function ownerCreateDistributor(address _addr, string memory _distributorName, string memory _distributorContact) public onlyOwner returns(string memory) {
        createDistributor(_addr, _distributorName, _distributorContact);
        
        return 'Distributor created successfully!';
    }
    
    
    function updateOrderStatus(address _orderId, string memory _latitude, string memory _longitude)public returns(string memory){
        orderMap[_orderId].locationsArr.push(location(_latitude, _longitude));
        
        return 'Status updated sucessfully!';
    }
    
    
    function getLocations(address _orderId) public view returns (string[] memory) {
        string[] memory ret = new string[](orderMap[_orderId].locationsArr.length);
        for (uint i = 0; i < orderMap[_orderId].locationsArr.length; i++) {
            ret[i] = orderMap[_orderId].locationsArr[i].latitude;
        }
        return ret;
    }
    
    
    function cancelOrder(address _orderId) public checkUser(orderMap[_orderId].customer) returns(string memory){
        require(orderMap[_orderId].orderstatus < 3);
        
        orderMap[_orderId].orderstatus = 5;
        orderMap[_orderId].transitstatus = 'Order Cancelled Successfully!';
        
        return orderMap[_orderId].transitstatus;
    }
   
}