import React, { useState, useEffect } from "react";
import { createUser, updateUser, getAllStores } from "../../api/api";
import "../../Styles/UserForm.css"; // Assuming you have a CSS file for the form

const UserForm = ({ existingUser, onSave, onCancel }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("vendedor");
  const [storeId, setStoreId] = useState("");
  const [stores, setStores] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingStores, setLoadingStores] = useState(true);
  const [storesError, setStoresError] = useState(null);

  // Effect to load the list of stores
  useEffect(() => {
    const loadStores = async () => {
      setLoadingStores(true);
      setStoresError(null);
      try {
        const res = await getAllStores();
        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        const storesArray = Array.isArray(data.stores) ? data.stores : data;
        setStores(storesArray);
        // Set a default storeId if creating a new user and the list is not empty
        if (!existingUser && storesArray.length > 0) {
          setStoreId(storesArray[0].storeId);
        }
      } catch (err) {
        console.error("Failed to fetch stores:", err);
        setStoresError("Error al cargar la lista de tiendas.");
      } finally {
        setLoadingStores(false);
      }
    };
    loadStores();
  }, [existingUser]); // Re-run if we switch between creating and editing

  // Effect to populate form fields when editing an existing user
  useEffect(() => {
    if (existingUser) {
      setEmail(existingUser.email);
      setRole(existingUser.role);
      setStoreId(existingUser.storeId);
      setPassword(""); // Password is not pre-filled for security
    } else {
      // Reset form for a new user
      setEmail("");
      setPassword("");
      setRole("vendedor");
      // Set a default storeId if the list of stores is already loaded
      if (stores.length > 0) {
        setStoreId(stores[0].storeId);
      }
    }
  }, [existingUser, stores]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      let response;
      const userData = { email, role, storeId };

      if (password) {
        userData.password = password; // Only add password if it's provided
      }

      if (existingUser) {
        // Update an existing user
        response = await updateUser({ ...userData, userId: existingUser.userId });
      } else {
        // Create a new user
        response = await createUser(userData);
      }

      if (response.ok) {
        setMessage(`Usuario ${existingUser ? "actualizado" : "creado"} exitosamente.`);
        onSave(); // Notify the parent component to refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error desconocido');
      }
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      setMessage(`Error al guardar el usuario: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <h3>{existingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}</h3>
      <input
        type="email"
        name="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        name="password"
        placeholder={existingUser ? "Nueva contraseña (opcional)" : "Contraseña"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required={!existingUser} // Required only for new users
      />
      <select name="role" value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="admin">Administrador</option>
        <option value="vendedor">Vendedor</option>
      </select>
      
      {loadingStores ? (
        <p>Cargando tiendas...</p>
      ) : storesError ? (
        <p className="error-message">{storesError}</p>
      ) : stores.length === 0 ? (
        <p>No hay tiendas disponibles.</p>
      ) : (
        <select name="storeId" value={storeId} onChange={(e) => setStoreId(e.target.value)} required>
          {stores.map((store) => (
            <option key={store.storeId} value={store.storeId}>
              {store.storeName} (ID: {store.storeId})
            </option>
          ))}
        </select>
      )}
      
      <div className="form-actions">
        <button type="submit">
          {existingUser ? "Actualizar" : "Crear"}
        </button>
        {onCancel && <button type="button" onClick={onCancel}>Cancelar</button>}
      </div>
      {message && <p className="form-message">{message}</p>}
    </form>
  );
};

export default UserForm;