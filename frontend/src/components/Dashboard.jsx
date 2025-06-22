import React from "react";
import { useAuth } from "../hooks/useAuth";
import UserForm from "./Users/UserForm.jsx";
import UserList from "./Users/UserList.jsx";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div>
      <h1>Bienvenido, {user?.email || "Usuario"}</h1>
      {isAdmin() ? (
        <>
          <UserForm />,
          <UserList />
          {/* Aquí luego puedes agregar lista usuarios, tiendas, etc */}
        </>
      ) : (
        <p>No tienes permisos para crear usuarios.</p>
      )}
    </div>
  );
};

export default Dashboard;
