import React, { useState, useEffect } from "react";
import { createProduct, updateProduct, getAllStores } from "../../api/api";
import { useAuth } from "../../hooks/useAuth";
import "../../Styles/ProductForm.css";

const ProductForm = ({ existingProduct, onSave, onCancel, isOpen }) => {
  const { user, isAdmin } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [storeId, setStoreId] = useState("");
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [storesError, setStoresError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27 && isOpen) {
        onCancel?.();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onCancel]);

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

  // Hook to fetch the list of stores if the user is an admin
  useEffect(() => {
    const fetchStores = async () => {
      setLoadingStores(true);
      setStoresError(null);
      try {
        const res = await getAllStores();
        if (!res.ok) {
          throw new Error("Failed to fetch stores");
        }
        const data = await res.json();
        const storesArray = Array.isArray(data.stores) ? data.stores : data;

        setStores(storesArray);
        if (storesArray.length > 0 && !existingProduct) {
          setStoreId(storesArray[0].storeId);
        }
      } catch (err) {
        console.error("Error fetching stores:", err);
        setStoresError("Error al cargar la lista de tiendas.");
      } finally {
        setLoadingStores(false);
      }
    };

    if (isAdmin()) {
      fetchStores();
    }
  }, [isAdmin, existingProduct]);

  // Hook to sync form fields with an existing product or reset them for creation
  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name || "");
      setDescription(existingProduct.description || "");
      setPrice(existingProduct.price !== undefined ? String(existingProduct.price) : "");
      setStock(existingProduct.stock !== undefined ? String(existingProduct.stock) : "");
      setImageUrl(existingProduct.imageUrl || "");
      setStoreId(existingProduct.storeId || "");
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setImageUrl("");
      if (isAdmin()) {
        setStoreId(stores.length > 0 ? stores[0].storeId : "");
      } else {
        setStoreId(user?.storeId || "");
      }
    }
    setFormError(null);
  }, [existingProduct, user, isAdmin, stores]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    // Form validation
    if (!name.trim() || !description.trim() || price === "" || stock === "" || !storeId) {
      setFormError("Por favor, completa todos los campos.");
      setIsSubmitting(false);
      return;
    }

    const priceValue = parseFloat(price);
    const stockValue = parseInt(stock, 10);

    if (stockValue % 1 !== 0 || isNaN(stockValue)) {
      setFormError("El stock debe ser un número entero válido.");
      setIsSubmitting(false);
      return;
    }
    if (isNaN(priceValue)) {
      setFormError("El precio debe ser un número válido.");
      setIsSubmitting(false);
      return;
    }

    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: priceValue,
      stock: stockValue,
      imageUrl: imageUrl.trim(),
      storeId: isAdmin() ? storeId : user.storeId
    };

    try {
      let res;
      if (existingProduct) {
        productData.productId = existingProduct.productId;
        res = await updateProduct(productData);
      } else {
        res = await createProduct(productData);
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error desconocido');
      }

      onSave?.();
      if (!existingProduct) {
        setName("");
        setDescription("");
        setPrice("");
        setStock("");
        setImageUrl("");
      }
      onCancel?.();
    } catch (error) {
      console.error("Error saving product:", error);
      setFormError(`Error al guardar el producto: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        {/* Header del modal */}
        <div className="modal-header">
          <h3 className="modal-title">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {existingProduct ? "Editar Producto" : "Crear Producto"}
          </h3>
          <button className="modal-close" onClick={onCancel} type="button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="product-form">
          {formError && <div className="form-error">{formError}</div>}

          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="name">Nombre:</label>
            <div className="input-container">
              <input
                id="name"
                placeholder="Nombre del producto"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label htmlFor="description">Descripción:</label>
            <textarea
              id="description"
              placeholder="Descripción del producto"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              disabled={isSubmitting}
              rows="3"
            />
          </div>

          {/* Precio y Stock en fila */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Precio:</label>
              <div className="input-container">
                <input
                  id="price"
                  type="number"
                  placeholder="Precio (ej. 12.50)"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                />
                <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock:</label>
              <div className="input-container">
                <input
                  id="stock"
                  type="number"
                  placeholder="Cantidad en stock (entero)"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  required
                  min="0"
                  step="1"
                  disabled={isSubmitting}
                />
                <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>

          {/* URL de imagen */}
          <div className="form-group optional-field">
            <label htmlFor="imageUrl">URL de la Imagen:</label>
            <div className="input-container">
              <input
                id="imageUrl"
                type="url"
                placeholder="URL de la imagen del producto"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                disabled={isSubmitting}
              />
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="optional-label">Opcional: URL de la imagen del producto</div>
          </div>

          {/* Tienda */}
          <div className="form-group">
            <label htmlFor="storeId">Tienda:</label>
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
                    onChange={e => setStoreId(e.target.value)} 
                    required 
                    disabled={isSubmitting}
                  >
                    {stores.map(store => (
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
                <div className="info-message">No hay tiendas disponibles para asignar.</div>
              )
            ) : (
              <div className="read-only-field">
                <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Tu tienda: <strong>{user?.storeId}</strong>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button type="button" onClick={onCancel} disabled={isSubmitting} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="submit-button">
              {isSubmitting ? (existingProduct ? "Actualizando..." : "Creando...") : (existingProduct ? "Actualizar" : "Crear")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;