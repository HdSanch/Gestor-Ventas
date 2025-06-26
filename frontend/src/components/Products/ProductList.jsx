import React, { useEffect, useState, useCallback } from "react"; // 1. Importa useCallback
import { useAuth } from "../../hooks/useAuth";
import { getAllProducts, deleteProduct } from "../../api/api";
import ProductForm from "./ProductForm";

const ProductList = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * 2. Usa useCallback para memoizar la función loadProducts.
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
  }, [user]); // 3. Agrega 'user' como dependencia de useCallback, ya que lo usas dentro de la función.

  /**
   * Effect hook to load products when the component mounts.
   * Ahora agregamos 'loadProducts' al array de dependencias.
   */
  useEffect(() => {
    loadProducts();
  }, [loadProducts]); // 4. Incluye la función memoizada en el array de dependencias.

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

  // --- Conditional Rendering based on state ---
  if (loading) {
    return <p>Cargando productos...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h2>Productos</h2>
      <button onClick={loadProducts}>Actualizar Lista</button>
      <ProductForm
        existingProduct={editingProduct}
        onSave={loadProducts}
        onCancel={() => setEditingProduct(null)}
      />
      {products.length === 0 ? (
        <p>No hay productos para mostrar.</p>
      ) : (
        <table>
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
                <td>{p.price}</td>
                <td>{p.stock}</td>
                <td>{p.storeId}</td>
                <td>
                  <button onClick={() => setEditingProduct(p)}>Editar</button>
                  <button onClick={() => handleDelete(p.productId)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductList;