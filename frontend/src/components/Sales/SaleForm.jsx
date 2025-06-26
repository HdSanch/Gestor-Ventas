import React, { useState, useEffect } from "react";
import { createSale, updateSale, getProductsByStore, getAllStores } from "../../api/api"; // 1. Importa getAllStores
import { useAuth } from "../../hooks/useAuth";
import "../../Styles/SaleForm.css";

const SaleForm = ({ editingSale, onSaveComplete, onCancelEdit }) => {
  const { user, isAdmin } = useAuth();

  const [storeId, setStoreId] = useState(user.storeId);
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]); // Nuevo estado para las tiendas
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingStores, setLoadingStores] = useState(false); // Nuevo estado de carga para tiendas
  const [productsError, setProductsError] = useState(null);
  const [storesError, setStoresError] = useState(null); // Nuevo estado de error para tiendas

  // Efecto para sincronizar el formulario si se está editando una venta
  useEffect(() => {
    if (editingSale) {
      setStoreId(editingSale.storeId);
      setProductId(editingSale.productId);
      setProductName(editingSale.productName);
      setQuantity(editingSale.quantity);
      setUnitPrice(editingSale.unitPrice);
    }
  }, [editingSale]);

  // 2. Nuevo efecto para cargar la lista de tiendas si el usuario es admin
  useEffect(() => {
    const fetchStores = async () => {
      if (!isAdmin()) return; // Solo carga las tiendas si es admin

      setLoadingStores(true);
      setStoresError(null);
      try {
        const res = await getAllStores();
        if (!res.ok) {
          throw new Error('Failed to fetch stores');
        }
        const data = await res.json();
        const storesArray = Array.isArray(data.stores) ? data.stores : data;
        setStores(storesArray);
        // Si no se está editando, establece el ID de la primera tienda como valor por defecto
        if (!editingSale && storesArray.length > 0) {
          setStoreId(storesArray[0].storeId);
        }
      } catch (err) {
        console.error("Error fetching stores:", err);
        setStoresError("Error al cargar la lista de tiendas.");
      } finally {
        setLoadingStores(false);
      }
    };
    
    fetchStores();
  }, [isAdmin, editingSale]); // Depende de si el usuario es admin y si se está editando

  /**
   * Efecto para cargar los productos de la tienda seleccionada.
   * Se dispara cuando el storeId cambia.
   */
  useEffect(() => {
    const fetchProducts = async () => {
      if (!storeId) {
        setProducts([]);
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
        const productsArray = Array.isArray(data) ? data : (data && Array.isArray(data.products) ? data.products : []);
        setProducts(productsArray);
      } catch (err) {
        console.error("Failed to fetch products for store:", err);
        setProductsError("Error al cargar los productos de la tienda. Intente de nuevo.");
        setProducts([]);
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
    if (products.length > 0 && productId) {
      const product = products.find((p) => p.productId === productId);
      if (product) {
        setProductName(product.name);
        setUnitPrice(product.price);
      } else {
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
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
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

      if (onSaveComplete) onSaveComplete();
    } catch (err) {
      console.error("Failed to save sale:", err);
      alert(`Error al guardar la venta: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="sale-form">
      <h3>{editingSale ? "Editar Venta" : "Registrar Nueva Venta"}</h3>
      
      {isAdmin() ? (
        // 3. Renderiza el select para admins
        <div className="form-group">
          <label htmlFor="storeIdSelect">ID de la Tienda:</label>
          {loadingStores ? (
            <p className="loading-message">Cargando tiendas...</p>
          ) : storesError ? (
            <p className="error-message">{storesError}</p>
          ) : stores.length > 0 ? (
            <select
              id="storeIdSelect"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              required
            >
              {stores.map((store) => (
                <option key={store.storeId} value={store.storeId}>
                  {store.storeName} (ID: {store.storeId})
                </option>
              ))}
            </select>
          ) : (
            <p className="info-message">No hay tiendas disponibles.</p>
          )}
        </div>
      ) : (
        // 4. Muestra el ID de la tienda para no-admins
        <div className="form-group">
          <label>ID de la Tienda:</label>
          <p className="read-only-field">{user?.storeId}</p>
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="productSelect">Selecciona producto:</label>
        <select id="productSelect" value={productId} onChange={(e) => setProductId(e.target.value)} required>
          <option value="">{loadingProducts ? "Cargando..." : "Selecciona producto"}</option>
          {products.map((p) => (
            <option key={p.productId} value={p.productId}>
              {p.name} (Stock: {p.stock})
            </option>
          ))}
        </select>
        {loadingProducts && <p className="loading-message">Cargando productos...</p>}
        {productsError && <p className="error-message">{productsError}</p>}
      </div>
      
      <div className="form-group">
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
      </div>

      <div className="form-group">
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
      </div>
      
      <div className="form-actions">
        <button type="submit">{editingSale ? "Actualizar" : "Registrar"} venta</button>
        {editingSale && <button type="button" onClick={onCancelEdit}>Cancelar</button>}
      </div>
    </form>
  );
};

export default SaleForm;