import React, { useState } from "react";

const MedicineList = ({ addToCart, availableMedicines }) => {
    const [search, setSearch] = useState("");

    // Filter the medicines based on search query
    const filteredMedicines = availableMedicines.filter(med =>
        med.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: "20px" }}>
            {/* Search Input */}
            <input
                type="text"
                placeholder="Search Medicines"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "20px",
                    borderRadius: "5px",
                    border: "1px solid #ddd",
                }}
            />
            
            {/* Medicine List */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                {filteredMedicines.map((med) => (
                    <div key={med.address} style={{ border: "1px solid #ddd", padding: "15px", textAlign: "center", borderRadius: "8px" }}>
                        {/* Medicine Info */}
                        <h3>{med.name}</h3>
                        <p style={{ fontSize: "14px", color: "#777" }}>{med.address}</p>
                        <p style={{ fontSize: "16px", fontWeight: "bold", color: "#4CAF50" }}>₹{med.price}</p>
                        
                        {/* Add to Cart Button */}
                        <button
                            onClick={() => addToCart(med)}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#4CAF50",
                                color: "#fff",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                        >
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MedicineList;