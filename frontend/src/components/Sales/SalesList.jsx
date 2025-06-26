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
  const [showForm, setShowForm] = useState(false); // State to control form visibility

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
    setShowForm(false); // Hide form after saving
    loadSales(); // Reload data after save
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="sales-list-container">
      <h2>Gestión de Ventas</h2>

      {/* Button to toggle the form */}
      <button onClick={() => setShowForm(!showForm)} className="toggle-form-button">
        {showForm ? "Ocultar Formulario" : "Registrar Nueva Venta"}
      </button>

      {/* Conditional rendering for the form */}
      {showForm && (
        <div className="form-section">
          <SaleForm
            onSaveComplete={handleSaveComplete}
            onCancelEdit={handleCancel}
          />
        </div>
      )}

      <div className="list-section">
        <div className="list-header">
            <h3>Historial de Ventas</h3>
            <button onClick={loadSales} className="refresh-button">
                Actualizar Lista
            </button>
        </div>
        
        {loading ? (
          <p className="state-message loading">Cargando ventas...</p>
        ) : error ? (
          <p className="state-message error">{error}</p>
        ) : sales.length === 0 ? (
          <p className="state-message empty">No hay ventas para mostrar.</p>
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
                {sales.map((sale) => (
                  <tr key={sale.saleId}>
                    <td>{sale.saleId}</td>
                    <td>{sale.productName}</td>
                    <td>{sale.quantity}</td>
                    <td>${sale.unitPrice.toFixed(2)}</td>
                    <td>${sale.totalPrice.toFixed(2)}</td>
                    <td>{sale.storeId}</td>
                    <td>{sale.userId}</td>
                    <td>{new Date(sale.timestamp).toLocaleString()}</td>
                    <td className="actions-cell">
                      <button onClick={() => handleDelete(sale.saleId)} className="delete-button">Eliminar</button>
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