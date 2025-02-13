import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import { makeStyles } from "@material-ui/core/styles";
import Navbar from '../../main_dashboard/components/Navbars/Navbar';
import Sidebar from "../../main_dashboard/components/Sidebar/Sidebar.js";
import styles from '../../main_dashboard/assets/jss/material-dashboard-react/layouts/adminStyle.js';
import bgImage from "../../main_dashboard/assets/img/sidebar-2.jpg";
import logo from "../../main_dashboard/assets/img/reactlogo.png";
import MedicineList from "./MedicineList";
import Cart from "./Cart";
import Orders from "./Orders";
import TransactionList from "./TransactionList";

// Icons
import Dashboard from "@material-ui/icons/Dashboard";
import Person from "@material-ui/icons/Person";
import ShoppingCart from "@material-ui/icons/ShoppingCart";
import Receipt from "@material-ui/icons/Receipt";
import History from "@material-ui/icons/History";

const useStyles = makeStyles(styles);

const routes = [
    { path: "/dashboard", name: "Dashboard", component: CustomerDashboard, layout: "/customer" },
    { path: "/profile", name: "User Profile", component: UserProfile, layout: "/customer" },
    { path: "/medicines", name: "Medicines", component: Medicines, layout: "/customer" },
    { path: "/cart", name: "Cart", component: Cart, layout: "/customer" },
    { path: "/orders", name: "Orders", component: Orders, layout: "/customer" },
    { path: "/transactions", name: "Transactions", component: TransactionList, layout: "/customer" },
];

export default function Customer({ account, supplyChain, web3, ...rest }) {
    const [transactions, setTransactions] = useState([]);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                // Get all MedicinePurchased events for this account
                const events = await supplyChain.contract.getPastEvents('MedicinePurchased', {
                    fromBlock: 0,
                    toBlock: 'latest',
                    filter: { buyer: account }
                });

                // Parse events into transaction objects
                const parsedTransactions = events.map(event => ({
                    medicineAddress: event.args.medicineAddress,
                    buyer: event.args.buyer,
                    quantity: event.args.quantity,
                    status: 'sold', // Default status
                    timestamp: new Date(event.args.timestamp * 1000).toLocaleString()
                }));

                // Fetch detailed transaction status using medicineRecievedAtCustomer
                if (supplyChain.contract.medicineRecievedAtCustomer) {
                    const updatedTransactions = await Promise.all(
                        parsedTransactions.map(async (transaction) => {
                            try {
                                const status = await supplyChain.contract.medicineRecievedAtCustomer(
                                    transaction.medicineAddress
                                );
                                return {
                                    ...transaction,
                                    status: status ? 'delivered' : 'in-transit'
                                };
                            } catch (error) {
                                console.error('Error fetching transaction status:', error);
                                return transaction;
                            }
                        })
                    );
                    
                    setTransactions(updatedTransactions);
                } else {
                    setTransactions(parsedTransactions);
                }
            } catch (error) {
                console.error('Error fetching transactions:', error);
                setTransactions([]);
            }
        };

        if (account && supplyChain) {
            fetchTransactions();
        }
    }, [account, supplyChain]);

    const switchRoutes = (
        <Switch>
            {routes.map((prop, key) => {
                if (prop.layout === "/customer") {
                    return (
                        <Route
                            path={prop.layout + prop.path}
                            render={() => (
                                <prop.component 
                                    account={account} 
                                    supplyChain={supplyChain} 
                                    web3={web3}
                                    transactions={transactions}
                                    setTransactions={setTransactions}
                                    cart={cart}
                                    setCart={setCart}
                                    orders={orders}
                                    setOrders={setOrders}
                                />
                            )}
                            key={key}
                        />
                    );
                }
                return null;
            })}
            <Redirect from="/customer" to="/customer/dashboard" />
        </Switch>
    );

    const classes = useStyles();
    const mainPanel = React.createRef();
    const [image, setImage] = React.useState(bgImage);
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const getRoute = () => {
        return window.location.pathname !== "/customer/maps";
    };

    React.useEffect(() => {
        if (navigator.platform.indexOf("Win") > -1) {
            ps = new PerfectScrollbar(mainPanel.current, {
                suppressScrollX: true,
                suppressScrollY: false
            });
            document.body.style.overflow = "hidden";
        }
        
        return function cleanup() {
            if (navigator.platform.indexOf("Win") > -1) {
                ps.destroy();
            }
        };
    }, [mainPanel]);

    return (
        <div className={classes.wrapper}>
            <Sidebar
                routes={routes}
                logoText={"Customer"}
                logo={logo}
                image={image}
                handleDrawerToggle={handleDrawerToggle}
                open={mobileOpen}
                color="blue"
                {...rest}
            />
            <div className={classes.mainPanel} ref={mainPanel}>
                <Navbar
                    routes={routes}
                    handleDrawerToggle={handleDrawerToggle}
                    {...rest}
                />

                {getRoute() ? (
                    <div className={classes.content}>
                        <div className={classes.container}>{switchRoutes}</div>
                    </div>
                ) : (
                    <div className={classes.map}>{switchRoutes}</div>
                )}
            </div>
        </div>
    );
}