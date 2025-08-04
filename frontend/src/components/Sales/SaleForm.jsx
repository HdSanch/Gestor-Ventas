import React, { useState, useEffect } from "react";
import { createSale, updateSale, getProductsByStore, getAllStores } from "../../api/api";
import { useAuth } from "../../hooks/useAuth";
import "../../Styles/SaleForm.css";

const SaleForm = ({ editingSale, onSaveComplete, onCancelEdit, isOpen }) => {
  const { user, isAdmin } = useAuth();

  const [storeId, setStoreId] = useState(user.storeId);
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingStores, setLoadingStores] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [storesError, setStoresError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27 && isOpen) {
        onCancelEdit?.();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onCancelEdit]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Efecto para sincronizar el formulario si se está editando una venta
  useEffect(() => {
    if (editingSale) {
      setStoreId(editingSale.storeId);
      setProductId(editingSale.productId);
      setProductName(editingSale.productName);
      setQuantity(editingSale.quantity);
      setUnitPrice(editingSale.unitPrice);
    } else {
      // Reset form for new sale
      setProductId("");
      setProductName("");
      setQuantity(1);
      setUnitPrice(0);
      setStoreId(user.storeId);
    }
    setFormError(null);
  }, [editingSale, user.storeId]);

  // Nuevo efecto para cargar la lista de tiendas si el usuario es admin
  useEffect(() => {
    const fetchStores = async () => {
      if (!isAdmin()) return;

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
  }, [isAdmin, editingSale]);

  // Efecto para cargar los productos de la tienda seleccionada
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
  }, [storeId]);

  // Efecto para autocompletar el nombre y precio del producto seleccionado
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
    setFormError(null);
    setIsSubmitting(true);

    // Validaciones
    if (!productId || quantity <= 0 || unitPrice <= 0) {
      setFormError("Por favor, completa todos los campos correctamente.");
      setIsSubmitting(false);
      return;
    }

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
      setFormError(`Error al guardar la venta: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancelEdit?.();
    }
  };

  // Calcular total de la venta
  const totalSale = (quantity * unitPrice).toFixed(2);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        {/* Header del modal */}
        <div className="modal-header">
          <h3 className="modal-title">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {editingSale ? "Editar Venta" : "Registrar Nueva Venta"}
          </h3>
          <button className="modal-close" onClick={onCancelEdit} type="button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="sale-form">
          {formError && <div className="form-error">{formError}</div>}

          {/* ID de la Tienda */}
          <div className="form-group">
            <label htmlFor="storeId">ID de la Tienda:</label>
            {isAdmin() ? (
              loadingStores ? (
                <div className="loading-message">Cargando tiendas...</div>
              ) : storesError ? (
                <div className="error-message">{storesError}</div>
              ) : stores.length > 0 ? (
                <div className="input-container">
                  <select
                    id="storeId"
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    required
                    disabled={isSubmitting}
                  >
                    {stores.map((store) => (
                      <option key={store.storeId} value={store.storeId}>
                        {store.storeName} (ID: {store.storeId})
                      </option>
                    ))}
                  </select>
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              ) : (
                <div className="info-message">No hay tiendas disponibles.</div>
              )
            ) : (
              <div className="read-only-field">
                <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {user?.storeId}
              </div>
            )}
          </div>

          {/* Seleccionar producto */}
          <div className="form-group">
            <label htmlFor="productSelect">Selecciona producto:</label>
            <div className="input-container">
              <select 
                id="productSelect" 
                value={productId} 
                onChange={(e) => setProductId(e.target.value)} 
                required
                disabled={isSubmitting || loadingProducts}
              >
                <option value="">{loadingProducts ? "Cargando..." : "Selecciona producto"}</option>
                {products.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.name} (Stock: {p.stock})
                  </option>
                ))}
              </select>
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            {loadingProducts && <div className="loading-message">Cargando productos...</div>}
            {productsError && <div className="error-message">{productsError}</div>}
          </div>

          {/* Cantidad y Precio unitario en fila */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Cantidad:</label>
              <div className="input-container">
                <input
                  id="quantity"
                  type="number"
                  placeholder="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                  min="1"
                  disabled={isSubmitting}
                />
                <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="unitPrice">Precio unitario:</label>
              <div className="input-container">
                <input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  required
                  disabled={isSubmitting}
                />
                <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total de la venta */}
          <div className="total-section">
            <div className="total-label">Total de la venta:</div>
            <div className="total-amount">${totalSale}</div>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button type="button" onClick={onCancelEdit} disabled={isSubmitting} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="submit-button">
              {isSubmitting ? (editingSale ? "Actualizando..." : "Registrando...") : (editingSale ? "Actualizar" : "Registrar venta")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleForm;