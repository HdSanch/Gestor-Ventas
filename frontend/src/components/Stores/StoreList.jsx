import React, { useEffect, useState } from "react";
import { getAllStores, deleteStore } from "../../api/api";
import StoreEditForm from "./StoreEditForm";
import StoreForm from "./StoreForm";

const StoreList = () => {
  // Estado para la lista de tiendas y el total
  const [stores, setStores] = useState([]);
  const [totalStores, setTotalStores] = useState(0); 
  
  // Estado para controlar qué tienda se está editando
  const [editingStore, setEditingStore] = useState(null);

  // Estados de UI para feedback al usuario
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches all stores from the API.
   * Handles loading, error, and both possible response formats from the Lambda function.
   */
  const loadStores = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch data from the API
      const res = await getAllStores();
      
      // 2. Check if the response is successful (e.g., status code 200)
      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }
      
      // 3. Parse the JSON data from the response
      const data = await res.json();
      
      // 4. Validate the response format and process the data accordingly.
      // Prioritize the new, structured format from the updated Lambda.
      if (data && Array.isArray(data.stores)) {
        console.log("Nuevo formato de API detectado y procesado.");
        setStores(data.stores);
        setTotalStores(data.total_stores); // Get the total count from the API response
      } 
      // 5. Fallback to handle the old API format (a simple array)
      else if (Array.isArray(data)) {
        console.log("Formato de API antiguo (array) detectado y procesado.");
        setStores(data);
        setTotalStores(data.length); // Use the length of the array as the total
      } 
      // 6. Handle any other invalid formats
      else {
        console.error("API returned data in an invalid format:", data);
        setError("La respuesta del servidor no es un formato válido.");
        setStores([]);
        setTotalStores(0);
      }
    } catch (err) {
      // Handle network errors or other exceptions
      console.error("Failed to fetch stores:", err);
      setError("Error al cargar las tiendas. Por favor, inténtelo de nuevo.");
      setStores([]);
      setTotalStores(0);
    } finally {
      // Always stop the loading state, regardless of success or error
      setLoading(false);
    }
  };

  /**
   * Handles the deletion of a store by its ID.
   */
  const handleDelete = async (storeId) => {
    // Add a confirmation dialog for better UX
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la tienda con ID ${storeId}?`)) {
      return; // Stop if the user cancels
    }
    
    try {
      // Call the delete API function
      await deleteStore(storeId);
      // Reload the list of stores to reflect the change
      loadStores(); 
    } catch (err) {
      console.error("Failed to delete store:", err);
      // You could set an error message state here to show a toast or alert
      alert(`Error al eliminar la tienda: ${err.message}`);
    }
  };

  /**
   * Effect hook to load stores when the component mounts.
   */
  useEffect(() => {
    loadStores();
  }, []); // The empty dependency array ensures this effect runs only once on mount

  // --- Conditional Rendering ---
  
  // Show a loading message while fetching data
  if (loading) {
    return <p>Cargando tiendas...</p>;
  }

  // Show an error message if the API call failed
  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  // Main component structure
  return (
    <div>
      <h2>Administración de Tiendas</h2>
      
      {/* NEW: Add a button to manually refresh the store list.
        It's disabled while data is loading.
      */}
      <button onClick={loadStores} disabled={loading}>
        {loading ? "Actualizando..." : "Actualizar"}
      </button>

      {/* Show the total number of stores */}
      <p>Total de tiendas: {totalStores}</p>

      {/* Render the StoreForm. The onStoreCreated prop reloads the list */}
      <StoreForm 
        onStoreCreated={loadStores} 
        onCancel={() => { /* Add logic here if needed, e.g., to hide the form */}} 
      />

      {/* Conditionally render the edit form or the store list table */}
      {editingStore ? (
        // Show the edit form when a store is selected for editing
        <StoreEditForm 
          store={editingStore} 
          onCancel={() => setEditingStore(null)} 
          onSave={loadStores} 
        />
      ) : (
        // Show the table and create form
        <>
          {stores.length === 0 ? (
            <p>No hay tiendas para mostrar.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Dirección</th>
                  <th>Fecha de creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => (
                  <tr key={s.storeId}>
                    <td>{s.storeId}</td>
                    <td>{s.storeName}</td>
                    <td>{s.address}</td>
                    <td>{s.createdAt}</td>
                    <td>
                      <button onClick={() => setEditingStore(s)}>Editar</button>
                      <button onClick={() => handleDelete(s.storeId)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default StoreList;