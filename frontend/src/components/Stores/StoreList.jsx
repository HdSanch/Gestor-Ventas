import React, { useEffect, useState, useCallback } from "react";
import { getAllStores, deleteStore } from "../../api/api";
import StoreForm from "./StoreForm"; // StoreForm now handles both create and edit
import "../../Styles/StoreList.css"; // Import the CSS file

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [editingStore, setEditingStore] = useState(null); // Null for create mode, object for edit
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false); // State to control form visibility

  /**
   * Fetches all stores from the API.
   * Handles loading, error, and both possible response formats from the Lambda function.
   * Using useCallback to memoize for performance.
   */
  const loadStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllStores();
      
      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (data && Array.isArray(data.stores)) {
        setStores(data.stores);
      } 
      else if (Array.isArray(data)) {
        setStores(data);
      } 
      else {
        console.error("API returned data in an invalid format:", data);
        setError("La respuesta del servidor no es un formato válido.");
        setStores([]);
      }
    } catch (err) {
      console.error("Failed to fetch stores:", err);
      setError("Error al cargar las tiendas. Por favor, inténtelo de nuevo.");
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  /**
   * Handles the deletion of a store by its ID.
   */
  const handleDelete = async (storeId) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la tienda con ID ${storeId}?`)) {
      return; 
    }
    
    try {
      const res = await deleteStore(storeId);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error desconocido al eliminar.');
      }
      loadStores(); 
    } catch (err) {
      console.error("Failed to delete store:", err);
      alert(`Error al eliminar la tienda: ${err.message}`);
    }
  };

  /**
   * Effect hook to load stores when the component mounts.
   */
  useEffect(() => {
    loadStores();
  }, [loadStores]); // Dependency on memoized loadStores

  // Function to handle opening the form for creation
  const handleCreateNewStore = () => {
    setEditingStore(null); // Ensure form is in create mode
    setShowForm(true); // Show the form
  };

  // Function to handle opening the form for editing
  const handleEdit = (store) => {
    setEditingStore(store); // Set the store to be edited
    setShowForm(true); // Show the form
  };

  // Callback when form saves successfully
  const handleSaveComplete = () => {
    setShowForm(false); // Hide the form
    setEditingStore(null); // Clear editing state
    loadStores(); // Reload list
  };

  // Callback when form is cancelled
  const handleCancelForm = () => {
    setShowForm(false); // Hide the form
    setEditingStore(null); // Clear editing state
  };

  return (
    <div className="store-list-container">
      <h2>Gestión de Tiendas</h2>
      
      {/* Button to toggle the form for creating/editing a store */}
      <button 
        onClick={() => {
          if (showForm) { // If form is currently visible, hide it
            setShowForm(false);
            setEditingStore(null); // Clear editing state when hiding
          } else { // If form is currently hidden, show it for creation
            handleCreateNewStore();
          }
        }} 
        className="toggle-form-button"
      >
        {showForm ? "Ocultar Formulario" : "Crear Nueva Tienda"}
      </button>

      {/* Conditionally render the StoreForm */}
      {showForm && (
        <div className="form-section">
          <StoreForm 
            existingStore={editingStore} // Pass the store object for editing, or null for creation
            onSave={handleSaveComplete} 
            onCancel={handleCancelForm} 
          />
        </div>
      )}

      {/* Section for the list of stores */}
      <div className="list-section">
        <div className="list-header">
          <h3>Listado de Tiendas</h3>
          <button onClick={loadStores} className="refresh-button">
            Actualizar Lista
          </button>
        </div>

        {/* Conditional rendering for loading, error, and empty states */}
        {loading ? (
          <p className="state-message loading">Cargando tiendas...</p>
        ) : error ? (
          <p className="state-message error">{error}</p>
        ) : stores.length === 0 ? (
          <p className="state-message empty">No hay tiendas para mostrar.</p>
        ) : (
          <div className="table-container">
            <table className="store-table">
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
                    <td>{s.createdAt ? new Date(s.createdAt).toLocaleString() : 'N/A'}</td>
                    <td className="actions-cell">
                      <button onClick={() => handleEdit(s)} className="edit-button">Editar</button>
                      <button onClick={() => handleDelete(s.storeId)} className="delete-button">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreList;