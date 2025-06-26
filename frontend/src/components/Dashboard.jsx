import React from "react";
import { useAuth } from "../hooks/useAuth";
import UserForm from "./Users/UserForm.jsx";
import UserList from "./Users/UserList.jsx";
import StoreList from "./Stores/StoreList.jsx";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div>
      <h1>Bienvenido, {user?.email || "Usuario"}</h1>
      {isAdmin() ? (
        <>
          <h2>Crear Usuario</h2>
          <UserForm />,
          <h2>Gestión de Usuarios</h2>
          <UserList />,
          <h2>Gestión de Tiendas</h2>
          <StoreList />
        </>
      ) : (
        <p>No tienes permisos para crear usuarios.</p>
      )}
    </div>
  );
};

export default Dashboard;
