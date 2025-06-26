import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import UserList from "./Users/UserList.jsx"; // This is the only user component needed
import StoreList from "./Stores/StoreList.jsx";
import ProductList from "./Products/ProductList";
import SalesList from "./Sales/SalesList.jsx";
import { useNavigate } from "react-router-dom";
import "../Styles/Dashboard.css"; 

const Dashboard = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // State to track which component is active
  const [activeComponent, setActiveComponent] = useState("products");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "users":
        // This single case now handles both the list and the form
        return <UserList />;
      case "stores":
        return <StoreList />;
      case "products":
        return <ProductList />;
      case "sales":
        return <SalesList />;
      default:
        return <ProductList />;
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Menú</h2>
          <p className="user-email">{user?.email || "Usuario"}</p>
        </div>
        <nav>
          <ul className="menu-list">
            <li
              onClick={() => setActiveComponent("products")}
              className={activeComponent === "products" ? "active" : ""}
            >
              Gestión de Productos
            </li>
            <li
              onClick={() => setActiveComponent("sales")}
              className={activeComponent === "sales" ? "active" : ""}
            >
              Gestión de Ventas
            </li>
            {/* Show admin-only links */}
            {isAdmin() && (
              <>
                <li
                  onClick={() => setActiveComponent("users")}
                  className={activeComponent === "users" ? "active" : ""}
                >
                  Gestión de Usuarios
                </li>
                <li
                  onClick={() => setActiveComponent("stores")}
                  className={activeComponent === "stores" ? "active" : ""}
                >
                  Gestión de Tiendas
                </li>
              </>
            )}
          </ul>
        </nav>
        {/* Logout button */}
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </aside>
      <main className="main-content">
        <h1>Dashboard</h1>
        <div className="component-view">
          {renderComponent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;