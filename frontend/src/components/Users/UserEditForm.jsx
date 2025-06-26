import React, { useState, useEffect } from "react";
import { updateUser } from "../../api/api";

const UserEditForm = ({ user, onCancel, onSave }) => {
  // Inicializa los estados con valores por defecto para evitar errores al inicio
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [storeId, setStoreId] = useState("");
  const [password, setPassword] = useState("");

  // Usa useEffect para sincronizar los estados locales con el prop 'user'
  useEffect(() => {
    // Verifica si 'user' es un objeto válido antes de acceder a sus propiedades
    if (user) {
      setEmail(user.email);
      setRole(user.role);
      setStoreId(user.storeId);
      setPassword(""); // Limpiar la contraseña cada vez que se selecciona un nuevo usuario
    }
  }, [user]); // Este efecto se ejecuta cada vez que el prop 'user' cambia

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.userId) {
      console.error("No se pudo guardar el usuario. userId no está definido.");
      return; // Detiene la ejecución si no hay un usuario válido
    }
    
    await updateUser({
      userId: user.userId,
      email,
      role,
      storeId,
      ...(password && { password }) // Solo enviar si hay valor
    });
    
    onSave();
    onCancel();
  };

  // Si 'user' es nulo, no renderices el formulario
  if (!user) {
    return null; // O puedes retornar un mensaje de carga o de error
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Editar Usuario</h3>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="admin">Administrador</option>
        <option value="vendedor">Vendedor</option>
      </select>
      <input type="text" value={storeId} onChange={(e) => setStoreId(e.target.value)} required />
      <input
        type="password"
        placeholder="Nueva contraseña (opcional)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Guardar</button>
      <button type="button" onClick={onCancel}>Cancelar</button>
    </form>
  );
};

export default UserEditForm;