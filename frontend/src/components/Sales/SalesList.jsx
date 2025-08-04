import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getSales, deleteSale } from "../../api/api";
import SaleForm from "./SaleForm";
import "../../Styles/SalesList.css";

const SalesList = () => {
  const { user, isAdmin } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Use useCallback to memoize the function and avoid re-creation
  const loadSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSales(user.role, user.storeId);
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const rawData = await res.json();
      let salesArray = [];
      
      if (rawData && typeof rawData.body === 'string') {
        try {
          const parsedBody = JSON.parse(rawData.body);
          if (Array.isArray(parsedBody)) {
            salesArray = parsedBody;
          } else if (parsedBody && Array.isArray(parsedBody.sales)) {
            salesArray = parsedBody.sales;
          } else {
            throw new Error("El contenido del body no es un array válido.");
          }
        } catch (parseError) {
          console.error("Error al parsear el cuerpo de la respuesta:", parseError);
          throw new Error("La respuesta del servidor no es un JSON válido.");
        }
      } else if (Array.isArray(rawData)) {
        salesArray = rawData;
      } else if (rawData && Array.isArray(rawData.sales)) {
        salesArray = rawData.sales;
      } else {
        console.error("API returned data in an invalid format:", rawData);
        throw new Error("El formato de la respuesta del servidor no es un formato válido.");
      }

      const filteredSales = isAdmin()
        ? salesArray
        : salesArray.filter(sale => sale.storeId === user.storeId);
        
      setSales(filteredSales);
    } catch (err) {
      console.error("Failed to load sales:", err);
      setError(`Error al cargar las ventas: ${err.message}`);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  // Carga las ventas cuando el componente se monta o el usuario cambia
  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleDelete = async (saleId) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la venta con ID ${saleId}?`)) {
      return; 
    }
    try {
      const response = await deleteSale(saleId);
      if (response.ok) {
        loadSales(); // Reload the list
        alert("Venta eliminada y stock restaurado.");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error desconocido al eliminar.');
      }
    } catch (err) {
      console.error("Failed to delete sale:", err);
      alert(`Error al eliminar la venta: ${err.message}`);
    }
  };

  const handleSaveComplete = () => {
    setShowForm(false);
    loadSales();
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  // Función para filtrar ventas por búsqueda
  const filteredSales = sales.filter(sale =>
    sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.saleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.storeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estadísticas
  const totalSales = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const averagePerSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  return (
    <div className="sales-list-container">
      {/* Header principal */}
      <div className="main-header">
        <div className="header-content">
          <h2>Gestión de Ventas</h2>
          <p className="sales-subtitle">Administra y registra todas las ventas</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="toggle-form-button"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Registrar Nueva Venta
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value total-sales">{totalSales}</div>
          <div className="stat-label">Total de Ventas</div>
          <div className="stat-period">Este mes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value total-revenue">${totalRevenue.toFixed(2)}</div>
          <div className="stat-label">Ingresos Totales</div>
          <div className="stat-period">Este mes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value average-sale">${averagePerSale.toFixed(2)}</div>
          <div className="stat-label">Promedio por Venta</div>
          <div className="stat-period">Este mes</div>
        </div>
      </div>

      {/* Modal del formulario */}
      <SaleForm
        onSaveComplete={handleSaveComplete}
        onCancelEdit={handleCancel}
        isOpen={showForm}
      />

      {/* Sección de lista */}
      <div className="list-section">
        <div className="section-title">Historial de Ventas</div>
        
        {/* Controles de búsqueda y filtros */}
        <div className="list-header">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar ventas por ID, producto o tienda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="filters-container">
            
            <button onClick={loadSales} className="refresh-button">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar Lista
            </button>
          </div>
        </div>
        
        {/* Estados de carga y tabla */}
        {loading ? (
          <p className="state-message loading">Cargando ventas...</p>
        ) : error ? (
          <p className="state-message error">{error}</p>
        ) : filteredSales.length === 0 ? (
          <p className="state-message empty">
            {searchTerm ? "No se encontraron ventas que coincidan con tu búsqueda." : "No hay ventas para mostrar."}
          </p>
        ) : (
          <div className="table-container">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>ID Venta</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Total</th>
                  <th>Tienda</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.saleId}>
                    <td className="sale-id">{sale.saleId}</td>
                    <td className="product-name">{sale.productName}</td>
                    <td>
                      <span className="quantity-badge">{sale.quantity}</span>
                    </td>
                    <td className="price-cell">${sale.unitPrice.toFixed(2)}</td>
                    <td className="total-price">${sale.totalPrice.toFixed(2)}</td>
                    <td>
                      <span className="store-id">{sale.storeId}</span>
                    </td>
                    <td className="user-id">{sale.userId}</td>
                    <td className="date-cell">
                      {new Date(sale.timestamp).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="actions-cell">
                      <button onClick={() => handleDelete(sale.saleId)} className="delete-button">
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

export default SalesList;