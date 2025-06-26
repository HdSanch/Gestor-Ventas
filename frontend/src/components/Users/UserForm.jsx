import React, { useEffect, useState } from "react";
import { createUser } from "../../api/api";
import { getAllStores } from "../../api/api"; // 1. Importa la función para obtener todas las tiendas

const UserForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("vendedor");
  const [storeId, setStoreId] = useState("");
  const [stores, setStores] = useState([]); // 2. Nuevo estado para almacenar las tiendas
  const [message, setMessage] = useState("");
  const [loadingStores, setLoadingStores] = useState(true); // Nuevo estado para la carga de tiendas
  const [storesError, setStoresError] = useState(null); // Nuevo estado para errores de carga de tiendas

  // 3. Función para cargar las tiendas desde la API
  const loadStores = async () => {
    setLoadingStores(true);
    setStoresError(null);
    try {
      const res = await getAllStores();
      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      
      // Maneja el formato de respuesta de tu API
      const storesArray = Array.isArray(data.stores) ? data.stores : data;
      
      setStores(storesArray);
      // Establece el storeId por defecto al primer elemento si existe
      if (storesArray.length > 0) {
        setStoreId(storesArray[0].storeId);
      }
    } catch (err) {
      console.error("Failed to fetch stores:", err);
      setStoresError("Error al cargar la lista de tiendas.");
    } finally {
      setLoadingStores(false);
    }
  };

  // 4. Carga las tiendas una vez que el componente se monta
  useEffect(() => {
    loadStores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Limpia el mensaje de estado
    try {
      // Usa el storeId que ahora viene del select
      const response = await createUser({ email, password, role, storeId });
      if (response.ok) {
        setMessage("Usuario creado exitosamente");
        setEmail("");
        setPassword("");
        setRole("vendedor");
        // No limpiamos storeId para que se mantenga el valor seleccionado.
      } else {
        const errorData = await response.json();
        setMessage(`Error al crear usuario: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error en la conexión:", error);
      setMessage("Error en la conexión. Por favor, inténtelo de nuevo.");
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
      
      {/* 5. Reemplaza el input de texto por un select */}
      {loadingStores ? (
        <p>Cargando tiendas...</p>
      ) : storesError ? (
        <p style={{ color: 'red' }}>{storesError}</p>
      ) : stores.length === 0 ? (
        <p>No hay tiendas disponibles.</p>
      ) : (
        <select
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          required
        >
          {/* 6. Mapea la lista de tiendas a opciones */}
          {stores.map((store) => (
            <option key={store.storeId} value={store.storeId}>
              {store.storeName} (ID: {store.storeId})
            </option>
          ))}
        </select>
      )}
      
      <button type="submit">Crear</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default UserForm;