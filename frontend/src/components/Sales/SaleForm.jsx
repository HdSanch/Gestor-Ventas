import React, { useState, useEffect } from "react";
import { createSale, updateSale, getProductsByStore } from "../../api/api";
import { useAuth } from "../../hooks/useAuth";

const SaleForm = ({ editingSale, onSaveComplete, onCancelEdit }) => {
  const { user, isAdmin } = useAuth();

  const [storeId, setStoreId] = useState(user.storeId);
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState(null);

  useEffect(() => {
    if (editingSale) {
      setStoreId(editingSale.storeId);
      setProductId(editingSale.productId);
      setProductName(editingSale.productName);
      setQuantity(editingSale.quantity);
      setUnitPrice(editingSale.unitPrice);
    }
  }, [editingSale]);

  /**
   * Efecto para cargar los productos de la tienda seleccionada.
   * Maneja carga y errores.
   */
  useEffect(() => {
    const fetchProducts = async () => {
      if (!storeId) {
        setProducts([]); // Limpiar la lista si no hay storeId
        return;
      }

      setLoadingProducts(true);
      setProductsError(null);
      try {
        const res = await getProductsByStore(storeId);

        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        
        let productsArray = [];
        // Validar si la respuesta es un array directo o está encapsulada en un objeto
        if (Array.isArray(data)) {
          productsArray = data;
        } else if (data && Array.isArray(data.products)) {
          productsArray = data.products; // Para APIs que encapsulan la respuesta
        } else {
          console.error("API returned data in an invalid format:", data);
          throw new Error("La respuesta del servidor no es un formato de productos válido.");
        }

        setProducts(productsArray);
      } catch (err) {
        console.error("Failed to fetch products for store:", err);
        setProductsError("Error al cargar los productos. Por favor, verifique el Store ID.");
        setProducts([]); // Asegura que 'products' sea siempre un array en caso de error
      } finally {
        setLoadingProducts(false);
      }
    };
    
    fetchProducts();
  }, [storeId]); // El efecto se ejecuta cada vez que cambia el storeId

  /**
   * Efecto para autocompletar el nombre y precio del producto seleccionado.
   */
  useEffect(() => {
    // Solo busca si tenemos una lista de productos válida
    if (products.length > 0 && productId) {
      const product = products.find((p) => p.productId === productId);
      if (product) {
        setProductName(product.name);
        setUnitPrice(product.price);
      } else {
        // Limpiar si el producto no se encuentra en la lista
        setProductName("");
        setUnitPrice(0);
      }
    }
  }, [productId, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const saleData = {
      saleId: editingSale?.saleId,
      productId,
      productName,
      quantity: Number(quantity), // Asegurar que sea número
      unitPrice: Number(unitPrice), // Asegurar que sea número
      totalPrice: Number(quantity) * Number(unitPrice),
      storeId,
      userId: user.userId,
      timestamp: new Date().toISOString()
    };
    
    // Aquí puedes añadir validaciones adicionales antes de enviar

    try {
      let res;
      if (editingSale) {
        res = await updateSale(saleData);
      } else {
        res = await createSale(saleData);
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error desconocido al guardar la venta.");
      }

      // Reiniciar el formulario o cerrar, solo si no estamos editando
      if (onSaveComplete) onSaveComplete();
    } catch (err) {
      console.error("Failed to save sale:", err);
      alert(`Error al guardar la venta: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {isAdmin() && (
        <>
          <label htmlFor="storeId">ID de la Tienda:</label>
          <input
            id="storeId"
            type="text"
            placeholder="Store ID"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            required
          />
          {loadingProducts && <p>Cargando productos...</p>}
          {productsError && <p style={{ color: 'red' }}>{productsError}</p>}
        </>
      )}
      
      <label htmlFor="productSelect">Selecciona producto:</label>
      <select id="productSelect" value={productId} onChange={(e) => setProductId(e.target.value)} required>
        <option value="">{loadingProducts ? "Cargando..." : "Selecciona producto"}</option>
        {products.map((p) => (
          <option key={p.productId} value={p.productId}>
            {p.name} (Stock: {p.stock})
          </option>
        ))}
      </select>

      <label htmlFor="quantity">Cantidad:</label>
      <input
        id="quantity"
        type="number"
        placeholder="Cantidad"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        required
        min="1"
      />

      <label htmlFor="unitPrice">Precio unitario:</label>
      <input
        id="unitPrice"
        type="number"
        step="0.01"
        placeholder="Precio unitario"
        value={unitPrice}
        onChange={(e) => setUnitPrice(Number(e.target.value))}
        required
      />

      <button type="submit">{editingSale ? "Actualizar" : "Registrar"} venta</button>
      {editingSale && <button type="button" onClick={onCancelEdit}>Cancelar</button>}
    </form>
  );
};

export default SaleForm;