import React from "react";
import MedicineJourney from "./MedicineJourney";

const Orders = (props) => {
    const [selectedOrder, setSelectedOrder] = React.useState(null);
    const [showVerification, setShowVerification] = React.useState(false);

    // Dummy supply chain addresses
    const dummySupplyChain = {
        manufacturer: "0x35b6cB38e729E7ac52ff94e117ec60dEF4d6fe29",
        transporter: "0x477FCc2e6cDd1Fcb37ED210b13dA36F4bfB875ff",
        supplier: "0x3E2568b773d8A2AaE4FF4EEEA5A6D3e81b4d4758",
        distributor: "0x7E97142CCF061A6D450d84683C00B9Fa798Be22b",
        wholesaler: "0x1F9c356ad09a1159d11f82EF94Cd746BD7Ccabaf"
    };

    const verifyOrder = (order) => {
        // For demonstration purposes, we'll use the dummy supply chain data
        const updatedOrder = {
            ...order,
            supplyChainData: dummySupplyChain,
            status: "Verified"
        };
        
        setShowVerification(true);
        setSelectedOrder(updatedOrder);
    };

    return (
        <div>
            <h2>My Orders</h2>
            {props.orders.length === 0 ? (
                <p>No orders placed yet.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {props.orders.map(order => (
                        <li key={order.id} style={{ borderBottom: "1px solid #ddd", padding: "10px 0" }}>
                            <strong>Order ID: {order.id}</strong>
                            <p>Status: <span style={{ color: order.status === "Verified" ? "green" : "red" }}>{order.status}</span></p>
                            <ul>
                                {order.items.map((item, index) => (
                                    <li key={index}>{item.name} - ₹{item.price}</li>
                                ))}
                            </ul>
                            {order.status !== "Verified" && (
                                <button
                                    onClick={() => verifyOrder(order)}
                                    style={{ padding: "5px 10px", backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer" }}
                                >
                                    Verify Order
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {showVerification && selectedOrder && (
                <div className="verification-overlay">
                    <MedicineJourney 
                        order={selectedOrder}
                        closeVerification={() => {
                            setShowVerification(false);
                            setSelectedOrder(null);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default Orders;