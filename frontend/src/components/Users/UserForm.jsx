import React, { useState } from "react";
import { createUser } from "../../api/api";

const UserForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("vendedor");
  const [storeId, setStoreId] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createUser({ email, password, role, storeId });
      if (response.ok) {
        setMessage("Usuario creado exitosamente");
        setEmail("");
        setPassword("");
        setRole("vendedor");
        setStoreId("");
      } else {
        setMessage("Error al crear usuario");
      }
    } catch {
      setMessage("Error en la conexión");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Crear Usuario</h2>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="admin">Administrador</option>
        <option value="vendedor">Vendedor</option>
      </select>
      <input
        type="text"
        placeholder="ID de tienda"
        value={storeId}
        onChange={(e) => setStoreId(e.target.value)}
        required
      />
      <button type="submit">Crear</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default UserForm;
