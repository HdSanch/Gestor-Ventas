import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getAllProducts, deleteProduct } from "../../api/api";
import ProductForm from "./ProductForm";
import "../../Styles/ProductList.css"; // Ensure this path is correct

const ProductList = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false); // New state to control form visibility

  /**
   * Usa useCallback para memoizar la función loadProducts.
   * Esto asegura que la función no cambie en cada render,
   * satisfaciendo la advertencia de useEffect.
   */
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllProducts();

      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      
      let productArray = [];
      if (Array.isArray(data)) {
        productArray = data;
      } else if (data && Array.isArray(data.products)) {
        productArray = data.products;
      } else {
        console.error("API returned data in an invalid format:", data);
        throw new Error("La respuesta del servidor no es un formato válido.");
      }

      const filtered = user.role === "admin"
        ? productArray
        : productArray.filter(p => p.storeId === user.storeId);

      setProducts(filtered);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Error al cargar los productos. Por favor, inténtelo de nuevo.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Effect hook to load products when the component mounts.
   */
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (productId) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el producto con ID ${productId}?`)) {
      return; 
    }
    try {
      await deleteProduct(productId);
      loadProducts();
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Error al eliminar el producto.");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true); // Show the form in edit mode
  };

  const handleSaveComplete = () => {
    setShowForm(false); // Hide form after saving
    setEditingProduct(null); // Reset editing state
    loadProducts(); // Reload products to see changes
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="product-list-container">
      <h2>Gestión de Productos</h2>

      {/* Button to toggle the form's visibility */}
      <button onClick={() => {
          setEditingProduct(null); // Ensure a new product is created
          setShowForm(!showForm);
        }}
        className="toggle-form-button"
      >
        {showForm ? "Ocultar Formulario" : "Agregar Nuevo Producto"}
      </button>

      {/* Conditionally render the form */}
      {showForm && (
        <div className="form-section">
          <ProductForm
            existingProduct={editingProduct}
            onSave={handleSaveComplete}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      {/* Section for the product list */}
      <div className="list-section">
        {/* Header for the list with title and refresh button */}
        <div className="list-header">
            <h3>Listado de Productos</h3>
            <button onClick={loadProducts} className="refresh-button">
                Actualizar Lista
            </button>
        </div>
      
        {/* Conditional rendering for loading, error, and empty states */}
        {loading ? (
          <p className="state-message loading">Cargando productos...</p>
        ) : error ? (
          <p className="state-message error">{error}</p>
        ) : products.length === 0 ? (
          <p className="state-message empty">No hay productos para mostrar.</p>
        ) : (
          <div className="table-container">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Tienda</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.productId}>
                    <td>{p.name}</td>
                    <td>{p.description}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>{p.stock}</td>
                    <td>{p.storeId}</td>
                    <td className="actions-cell">
                      <button onClick={() => handleEdit(p)} className="edit-button">Editar</button>
                      <button onClick={() => handleDelete(p.productId)} className="delete-button">Eliminar</button>
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

export default ProductList;