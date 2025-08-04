import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getAllProducts, deleteProduct } from "../../api/api";
import ProductForm from "./ProductForm";
import "../../Styles/ProductList.css";

const ProductList = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * Usa useCallback para memoizar la función loadProducts.
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
    setShowForm(true);
  };

  const handleSaveComplete = () => {
    setShowForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // Función para filtrar productos por búsqueda
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para determinar el nivel de stock
  const getStockLevel = (stock) => {
    if (stock > 20) return 'high-stock';
    if (stock > 5) return 'medium-stock';
    return 'low-stock';
  };

  return (
    <div className="product-list-container">
      {/* Header principal */}
      <div className="main-header">
        <div className="header-content">
          <h2>Gestión de Productos</h2>
          <p className="product-subtitle">Administra tu inventario de productos</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setShowForm(!showForm);
          }}
          className="toggle-form-button"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {showForm ? "Ocultar Formulario" : "Agregar Nuevo Producto"}
        </button>
      </div>

      {/* Formulario modal */}
      <ProductForm
        existingProduct={editingProduct}
        onSave={handleSaveComplete}
        onCancel={handleCancelEdit}
        isOpen={showForm}
      />

      {/* Sección de lista */}
      <div className="list-section">
        {/* Header con búsqueda y actualizar */}
        <div className="list-header">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button onClick={loadProducts} className="refresh-button">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar Lista
          </button>
        </div>
      
        {/* Estados de carga y tabla */}
        {loading ? (
          <p className="state-message loading">Cargando productos...</p>
        ) : error ? (
          <p className="state-message error">{error}</p>
        ) : filteredProducts.length === 0 ? (
          <p className="state-message empty">
            {searchTerm ? "No se encontraron productos que coincidan con tu búsqueda." : "No hay productos para mostrar."}
          </p>
        ) : (
          <div className="table-container">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Imagen</th>
                  <th>Tienda</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.productId}>
                    <td>{p.name}</td>
                    <td>{p.description}</td>
                    <td className="price-cell">${p.price.toFixed(2)}</td>
                    <td>
                      <span className={`stock-badge ${getStockLevel(p.stock)}`}>
                        {p.stock} {p.stock === 1 ? 'unidad' : 'unidades'}
                      </span>
                    </td>
                    <td>
                      {p.imageUrl ? (
                        <img 
                          src={p.imageUrl} 
                          alt={p.name} 
                          className="product-image"
                        />
                      ) : (
                        <div className="no-image">Sin imagen</div>
                      )}
                    </td>
                    <td>
                      <span className="store-id">{p.storeId}</span>
                    </td>
                    <td className="actions-cell">
                      <button onClick={() => handleEdit(p)} className="edit-button">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(p.productId)} className="delete-button">
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

export default ProductList;