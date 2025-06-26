import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getSales, deleteSale } from "../../api/api";
import SaleForm from "./SaleForm"; // Importa el formulario

const SalesList = () => {
  const { user, isAdmin } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSales = async () => {
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
  };

  // Carga las ventas cuando el usuario cambia
  useEffect(() => {
    loadSales();
  }, [user]);

  const handleDelete = async (saleId) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la venta con ID ${saleId}?`)) {
      return; 
    }
    try {
      const response = await deleteSale(saleId);
      if (response.ok) {
        // Vuelve a cargar la lista para ver el cambio de stock
        loadSales();
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
  
  // Renderizado condicional para mostrar estado de carga/error
  if (loading) {
    return <p>Cargando ventas...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }
  
  return (
    <div>
      <h2>Registrar Nueva Venta</h2>
      {/* Restauramos el formulario para crear nuevas ventas.
        Pasamos `onSaveComplete` para que la lista se actualice después de guardar.
        `editingSale` ya no se pasa, por lo que el formulario estará en modo creación.
      */}
      <SaleForm
        onSaveComplete={() => loadSales()}
        onCancelEdit={() => {}} // No hace nada, pero es buena práctica para evitar errores
      />

      <hr style={{ margin: '20px 0' }} />

      <h2>Lista de Ventas</h2>
      <button onClick={loadSales}>Actualizar Lista</button>
      
      {sales.length === 0 ? (
        <p>No hay ventas para mostrar.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
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
                <td>{sale.productName}</td>
                <td>{sale.quantity}</td>
                <td>{sale.unitPrice}</td>
                <td>{sale.totalPrice}</td>
                <td>{sale.storeId}</td>
                <td>{sale.userId}</td>
                <td>{new Date(sale.timestamp).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleDelete(sale.saleId)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SalesList;