import React, { useState } from "react";
import { updateUser } from "../../api/api";

const UserEditForm = ({ user, onCancel, onSave }) => {
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [storeId, setStoreId] = useState(user.storeId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUser({ userId: user.userId, email, role, storeId });
    onSave();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Editar Usuario</h3>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="admin">Administrador</option>
        <option value="vendedor">Vendedor</option>
      </select>
      <input type="text" value={storeId} onChange={(e) => setStoreId(e.target.value)} required />
      <button type="submit">Guardar</button>
      <button type="button" onClick={onCancel}>Cancelar</button>
    </form>
  );
};

export default UserEditForm;
