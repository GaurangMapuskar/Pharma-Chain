import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect ,Link} from "react-router-dom";
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import { makeStyles } from "@material-ui/core/styles";
import Navbar from '../../main_dashboard/components/Navbars/Navbar';
import Sidebar from "../../main_dashboard/components/Sidebar/Sidebar.js";
import styles from '../../main_dashboard/assets/jss/material-dashboard-react/layouts/adminStyle.js';
import MedicineList from "./MedicineList";
import Cart from "./Cart";
import Orders from "./Orders";
import logo from "../../main_dashboard/assets/img/reactlogo.png";
import bgImage from "../../main_dashboard/assets/img/sidebar-2.jpg";
import { medicinesData } from "./medicines____.js";
import supplyChainABI from "../../build/SupplyChain.json"

import DistributorDashboard from '../../main_dashboard/views/Dashboard/Dashboard';
import UserProfile from '../../main_dashboard/views/UserProfile/UserProfile';
import Maps from "../../main_dashboard/views/Maps/Maps.js";

// // Icons
// import Dashboard from "@material-ui/icons/Dashboard";
// import Person from "@material-ui/icons/Person";
// import ShoppingCart from "@material-ui/icons/ShoppingCart";
// import Receipt from "@material-ui/icons/Receipt";
// import History from "@material-ui/icons/History";

// const routes = [
//     {
//       path: "/medicines",
//       name: "Available Medicines",
//       component: MedicineList,
//       layout: "/customer"
//     },
//     {
//       path: "/cart",
//       name: "Shopping Cart",
//       component: Cart,
//       layout: "/customer"
//     },
//     {
//       path: "/orders",
//       name: "Order History",
//       component: Orders,
//       layout: "/customer"
//     },
//   ];

const useStyles = makeStyles(styles);


export default function Customer({ account, supplyChain, web3, ...rest }) {
    // const [transactions, setTransactions] = useState([]);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [availableMedicines, setAvailableMedicines] = useState(medicinesData);
    let ps;

    useEffect(() => {
        const fetchAvailableMedicines = async () => {
            try {
                const medicineAddresses = await supplyChain.contract.MedicineBatchAtCustomer(account);
                const medicines = await Promise.all(
                    medicineAddresses.map(async (address) => {
                        const medicine = supplyChain.contract.Medicine(address);
                        return {
                            address,
                            name: await medicine.name(),
                            price: await medicine.price(),
                            quantity: await medicine.quantity()
                        };
                    })
                );
                setAvailableMedicines(medicines);
            } catch (error) {
                console.error('Error fetching available medicines:', error);
            }
        };

        if (account && supplyChain) {
            fetchAvailableMedicines();
        }
    }, [account, supplyChain]);

    const addToCart = (medicine) => {
        setCart(prevCart => {const newCart = [...prevCart, medicine];
            // console.log("Updated cart:", newCart);
            return newCart;});
            console.log(cart);
            
    };

    const removeFromCart = (medicine) => {
        setCart(prevCart => prevCart.filter(item => item.address !== medicine.address));
    };

    const addToOrders = (order) => {
      setOrders(prevOrders => [...prevOrders, order]);
  };

    const routes = [
        { path: "/medicines", name: "Available Medicines", component: ({ availableMedicines }) => 
            (<MedicineList addToCart={addToCart} availableMedicines={availableMedicines} />),
            layout: "/customer" },
        { path: "/cart", name: "Cart", component: ({ cart }) => 
            (<Cart cart={cart} removeFromCart={removeFromCart} web3={web3} account={account}
                address={rest.address} setCart={setCart}
                addToOrders={addToOrders} />), layout: "/customer" },
        { path: "/orders", name: "Orders", component: Orders, layout: "/customer" },
    ];


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
                                    // addToCart={addToCart}
                                    // removeFromCart={removeFromCart}
                                    // placeOrder={placeOrder}
                                    availableMedicines={availableMedicines}
                                    cart={cart}
                                    orders={orders}
                                />
                            )}
                            key={key}
                        />
                    );
                }
                return null;
            })}
            <Route exact path="/customer/medicines/:id" component={MedicineList} />
            <Route exact path="/customer/orders/:id" component={Orders} />
            <Route exact path="/customer/cart/:id" component={Cart} />
            <Redirect from="/customer" to="/customer/medicines" />
        </Switch>
    );

    const classes = useStyles();
      const mainPanel = React.createRef();
    
      const [ image, setImage ] = React.useState(bgImage);
      const [ color, setColor ] = React.useState("blue");
      const [ fixedClasses, setFixedClasses ] = React.useState("dropdown show");
      const [ mobileOpen, setMobileOpen ] = React.useState(false);
      const handleImageClick = image => {
        setImage(image);
      };
      const handleColorClick = color => {
        setColor(color);
      };
      const handleFixedClick = () => {
        if (fixedClasses === "dropdown") {
          setFixedClasses("dropdown show");
        } else {
          setFixedClasses("dropdown");
        }
      };
      const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
      };
      const getRoute = () => {
        return window.location.pathname !== "/customer/maps";
      };
      const resizeFunction = () => {
        if (window.innerWidth >= 960) {
          setMobileOpen(false);
        }
      };
    
      React.useEffect(() => {
        if (navigator.platform.indexOf("Win") > -1) {
          ps = new PerfectScrollbar(mainPanel.current, {
            suppressScrollX: true,
            suppressScrollY: false
          });
          document.body.style.overflow = "hidden";
        }
        window.addEventListener("resize", resizeFunction);
    
        return function cleanup() {
          if (navigator.platform.indexOf("Win") > -1) {
            ps.destroy();
          }
          window.removeEventListener("resize", resizeFunction);
        };
      }, [ mainPanel ]);
    
      return (
        <div className={classes.wrapper}>
          {/* <Sidebar
            routes={routes}
            logoText={"Customer"}
            logo={logo}
            image={image}
            handleDrawerToggle={handleDrawerToggle}
            open={mobileOpen}
            color={color}
            {...rest}
          /> */}
          <div className={classes.mainPanel} ref={mainPanel}>
            <Navbar
              routes={routes}
              handleDrawerToggle={handleDrawerToggle}
              {...rest}
            />
            <div className={classes.wrapper}>
            <div className={classes.mainPanel} ref={mainPanel}>
                <Navbar
                    routes={routes}
                    handleDrawerToggle={handleDrawerToggle}
                    {...rest}
                />
                
                {/* Add the navigation buttons */}
                <div className={classes.content}>
                    <div className={classes.container}>
                        {/* Navigation buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginBottom: '20px' }}>
                            <Link to="/customer/medicines" style={{ textDecoration: 'none' }}>
                                <button 
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#4CAF50',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
                                >
                                    Home
                                </button>
                            </Link>
                            <Link to="/customer/cart" style={{ textDecoration: 'none' }}>
                                <button 
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#4CAF50',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
                                >
                                    View Cart
                                </button>
                            </Link>
                            <Link to="/customer/orders" style={{ textDecoration: 'none' }}>
                                <button 
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#2196F3',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#1976D2'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#2196F3'}
                                >
                                    View Orders
                                </button>
                            </Link>
                        </div>
                        {switchRoutes}
                    </div>
                </div>
            </div>
        </div>
    
            {getRoute() ? (
              <div className={classes.content}>
                <div className={classes.container}>{switchRoutes}</div>
              </div>
            ) :
              (
                <div className={classes.map}>{switchRoutes}</div>
              )
            }
          </div>
        </div>
      );
} 