import React, { useEffect, useState, useCallback } from "react";
import { getAllStores, deleteStore } from "../../api/api";
import StoreForm from "./StoreForm";
import "../../Styles/StoreList.css";

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [editingStore, setEditingStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
  }, []);

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

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const handleEdit = (store) => {
    setEditingStore(store);
    setShowForm(true);
  };

  const handleSaveComplete = () => {
    setShowForm(false);
    setEditingStore(null);
    loadStores();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingStore(null);
  };

  // Función para filtrar tiendas por búsqueda
  const filteredStores = stores.filter(store =>
    store.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.storeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estadísticas
  const totalStores = filteredStores.length;
  const activeStores = filteredStores.filter(store => store.isActive !== false).length;
  const totalSales = filteredStores.reduce((sum, store) => sum + (store.totalSales || 0), 0);
  const totalRevenue = filteredStores.reduce((sum, store) => sum + (store.totalRevenue || 0), 0);

  return (
    <div className="store-list-container">
      {/* Header principal */}
      <div className="main-header">
        <div className="header-content">
          <h2>Gestión de Tiendas</h2>
          <p className="store-subtitle">Administra todas las ubicaciones de tu negocio</p>
        </div>
        <button 
          onClick={() => {
            setEditingStore(null);
            setShowForm(!showForm);
          }}
          className="toggle-form-button"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Nueva Tienda
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total-stores">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="stat-value total-count">{totalStores}</div>
          <div className="stat-label">Total Tiendas</div>
        </div>
        
        
        
      </div>

      {/* Modal del formulario */}
      <StoreForm
        existingStore={editingStore}
        onSave={handleSaveComplete}
        onCancel={handleCancelForm}
        isOpen={showForm}
      />

      {/* Sección de lista */}
      <div className="list-section">
        <div className="section-title">Listado de Tiendas</div>
        
        {/* Controles de búsqueda */}
        <div className="list-header">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar tiendas por nombre, dirección o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button onClick={loadStores} className="refresh-button">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar Lista
          </button>
        </div>

        {/* Estados de carga y tabla */}
        {loading ? (
          <p className="state-message loading">Cargando tiendas...</p>
        ) : error ? (
          <p className="state-message error">{error}</p>
        ) : filteredStores.length === 0 ? (
          <p className="state-message empty">
            {searchTerm ? "No se encontraron tiendas que coincidan con tu búsqueda." : "No hay tiendas para mostrar."}
          </p>
        ) : (
          <div className="table-container">
            <table className="store-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Dirección</th>

                  <th>Fecha de Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.map((s) => (
                  <tr key={s.storeId}>
                    <td className="store-id-cell">
                      <span className="store-id-badge">{s.storeId}</span>
                    </td>
                    <td className="store-name">{s.storeName}</td>
                    <td className="store-address">{s.address}</td>
                    
                    <td className="date-cell">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </td>
                    <td className="actions-cell">
                      <button onClick={() => handleEdit(s)} className="edit-button">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(s.storeId)} className="delete-button">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
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