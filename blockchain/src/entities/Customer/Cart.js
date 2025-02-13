import React, { useState } from "react";
import Customer from "../../build/Customer.json";
import { utils } from "web3";

const CUSTOMER_CONTRACT_ADDRESS = "0x1e1B33270CB6D464629930FD9484c9376347A8A7";

const Cart = (props) => {
    const [transactionStatus, setTransactionStatus] = useState("");
    const [account] = useState(props.account);
    const [web3] = useState(props.web3);

    const handleOrderPlacement = async () => {
        try {
            if (!web3 || !web3.eth) {
                throw new Error("Web3 not initialized");
            }

            // Calculate total amount using BN to handle large numbers
            const totalAmount = props.cart.reduce((sum, item) => {
                const amount = utils.BN(item.price).mul(utils.BN(item.quantity));
                return sum.add(amount);
            }, new utils.BN(0));

            const customerContract = new web3.eth.Contract(Customer.abi, CUSTOMER_CONTRACT_ADDRESS);
            const orderId = utils.toHex(100);

            // Request accounts to ensure MetaMask is triggered
            const accounts = await web3.eth.getAccounts();
            const fromAccount = accounts[0];

            // Use .send() instead of .call() for state-changing transactions
            const transaction = await customerContract.methods
                .placeOrder(orderId, account, totalAmount.toString())
                .send({ from: fromAccount });

            // Create order object with transaction details
            const order = {
                id: transaction.transactionHash,
                items: props.cart,
                totalAmount: totalAmount.toString(),
                transactionHash: transaction.transactionHash,
                timestamp: new Date().toISOString(),
            };

            // Clear cart and add order to orders list
            props.setCart([]);
            props.addToOrders(order);

            setTransactionStatus("Order placed successfully on blockchain. Transaction hash: " + transaction.transactionHash);
        } catch (error) {
            console.error("Error placing order:", error);
            setTransactionStatus("Error placing order. Please try again.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            {/* Title */}
            <h2>Your Cart</h2>

            {/* Empty cart check */}
            {props.cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    {/* Cart Items */}
                    <ul style={{ listStyleType: "none", padding: "0" }}>
                        {props.cart.map((item, index) => (
                            <li key={index} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ddd", padding: "10px 0" }}>
                                <div>
                                    <strong>{item.name}</strong><br />
                                    <span>₹{item.price}</span>
                                </div>
                                <button
                                    onClick={() => props.removeFromCart(item)}
                                    style={{
                                        backgroundColor: "#f44336",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "5px",
                                        padding: "5px 10px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Place Order Button */}
                    <button
                        onClick={handleOrderPlacement}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#4CAF50",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginTop: "20px",
                        }}
                    >
                        Place Order
                    </button>

                    {/* Transaction Status */}
                    {transactionStatus && (
                        <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f8f9fa" }}>
                            {transactionStatus}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Cart;