import React from "react";

// Sample supply chain data with dummy addresses
const DUMMY_SUPPLY_CHAIN_DATA = {
    supplier: "0x3E2568b773d8A2AaE4FF4EEEA5A6D3e81b4d4758",
    transporter: "0x477FCc2e6cDd1Fcb37ED210b13dA36F4bfB875ff",
    manufacturer: "0x35b6cB38e729E7ac52ff94e117ec60dEF4d6fe29",
    transporter: "0x477FCc2e6cDd1Fcb37ED210b13dA36F4bfB875ff",
    wholesaler: "0x1F9c356ad09a1159d11f82EF94Cd746BD7Ccabaf",  
    transporter: "0x477FCc2e6cDd1Fcb37ED210b13dA36F4bfB875ff",
    distributor: "0x7E97142CCF061A6D450d84683C00B9Fa798Be22b",
};

const MedicineJourney = ({ order, closeVerification }) => {
    const [showDetails, setShowDetails] = React.useState(false);
    const [showTooltip, setShowTooltip] = React.useState(false);
    const [tooltipContent, setTooltipContent] = React.useState("");
    const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

    const getStepStatus = (step) => {
        // For demo purposes, we'll consider all steps as verified
        return DUMMY_SUPPLY_CHAIN_DATA[step] ? "verified" : "pending";
    };

    const getStepLabel = (step) => {
        return {
            manufacturer: "Manufacturer",
            transporter: "Transporter",
            supplier: "Supplier",
            distributor: "Distributor",
            wholesaler: "Wholesaler"
        }[step];
    };

    const formatAddress = (address) => {
        if (!address) return "No address available";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const handleMouseEnter = (event, step) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            x: rect.left + window.scrollX,
            y: rect.bottom + window.scrollY + 10
        });
        setShowTooltip(true);
        setTooltipContent(DUMMY_SUPPLY_CHAIN_DATA[step] || "No address available");
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-[90%] max-w-3xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">Medicine Verification Journey</h3>
                    <button 
                        onClick={() => setShowDetails(!showDetails)}
                        className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                    >
                        {showDetails ? "Hide Details" : "Show Details"}
                    </button>
                </div>
                
                <div className="relative py-8">
                    <div className="absolute top-1/2 left-[15%] right-[15%] h-1 bg-gray-200 -translate-y-1/2" />
                    
                    <div className="relative flex justify-between">
                        {Object.keys(DUMMY_SUPPLY_CHAIN_DATA).map((step, index) => {
                            const isVerified = getStepStatus(step) === "verified";
                            
                            return (
                                <div key={step} className="relative flex flex-col items-center w-1/5">
                                    {index > 0 && (
                                        <div 
                                            className={`absolute top-5 right-1/2 w-full h-1 ${
                                                isVerified ? "bg-green-500" : "bg-gray-200"
                                            }`}
                                            style={{ right: "50%" }}
                                        />
                                    )}
                                    
                                    <div 
                                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                                            isVerified 
                                                ? "bg-green-500 text-white" 
                                                : "bg-gray-200 text-gray-500"
                                        }`}
                                    >
                                        {isVerified ? "✓" : index + 1}
                                    </div>
                                    
                                    <div className="mt-3 text-center">
                                        <div className="font-medium text-sm text-gray-700">
                                            {getStepLabel(step)}
                                        </div>
                                        
                                        {showDetails && (
                                            <div className="relative mt-2">
                                                <div 
                                                    className="text-xs bg-gray-50 p-2 rounded-md cursor-help hover:bg-gray-100"
                                                    onMouseEnter={(e) => handleMouseEnter(e, step)}
                                                    onMouseLeave={() => setShowTooltip(false)}
                                                >
                                                    {formatAddress(DUMMY_SUPPLY_CHAIN_DATA[step])}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {showTooltip && (
                    <div 
                        className="fixed bg-white p-3 rounded-lg shadow-lg text-sm max-w-xs z-50 border border-gray-200"
                        style={{
                            left: tooltipPosition.x,
                            top: tooltipPosition.y
                        }}
                    >
                        <div className="text-gray-700 break-all">{tooltipContent}</div>
                    </div>
                )}

                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={closeVerification}
                        className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicineJourney;