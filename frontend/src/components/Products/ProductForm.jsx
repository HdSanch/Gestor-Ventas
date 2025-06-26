import React, { useState, useEffect } from "react";
import { createProduct, updateProduct, getAllStores } from "../../api/api";
import { useAuth } from "../../hooks/useAuth";
import "../../Styles/ProductForm.css"; // Import the CSS file

const ProductForm = ({ existingProduct, onSave, onCancel }) => {
  const { user, isAdmin } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [storeId, setStoreId] = useState("");
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [storesError, setStoresError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null); // New state for form-specific errors

  // Hook to fetch the list of stores if the user is an admin.
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
        // Set a default storeId for admins in create mode if stores are available.
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

  // Hook to sync form fields with an existing product or reset them for creation.
  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name || "");
      setDescription(existingProduct.description || "");
      setPrice(existingProduct.price !== undefined ? String(existingProduct.price) : "");
      setStock(existingProduct.stock !== undefined ? String(existingProduct.stock) : "");
      setStoreId(existingProduct.storeId || "");
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      // Set the storeId based on user role.
      if (isAdmin()) {
        // Admin's default storeId is the first in the list, if available.
        setStoreId(stores.length > 0 ? stores[0].storeId : "");
      } else {
        // Vender's storeId is fixed to their assigned store.
        setStoreId(user?.storeId || "");
      }
    }
    setFormError(null); // Clear form errors on product change
  }, [existingProduct, user, isAdmin, stores]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null); // Clear previous errors
    setIsSubmitting(true);

    // Form validation
    if (!name.trim() || !description.trim() || price === "" || stock === "" || !storeId) {
      setFormError("Por favor, completa todos los campos.");
      setIsSubmitting(false);
      return;
    }

    const priceValue = parseFloat(price);
    const stockValue = parseInt(stock, 10); // Use radix 10 for safety

    // Check if stock is an integer and not a float
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
      storeId: isAdmin() ? storeId : user.storeId // Enforce storeId for sellers
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

      // Call parent handlers on success
      onSave?.();
      // Reset form on successful creation, but keep editing form open.
      if (!existingProduct) {
        setName("");
        setDescription("");
        setPrice("");
        setStock("");
      }
      onCancel?.(); // Close the form after saving
    } catch (error) {
      console.error("Error saving product:", error);
      setFormError(`Error al guardar el producto: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h3>{existingProduct ? "Editar producto" : "Crear producto"}</h3>

      {formError && <p className="form-error">{formError}</p>}

      <div className="form-group">
        <label htmlFor="name">Nombre:</label>
        <input
          id="name"
          placeholder="Nombre del producto"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción:</label>
        <textarea
          id="description"
          placeholder="Descripción del producto"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          disabled={isSubmitting}
          rows="3" // Adjust rows for better visibility
        ></textarea>
      </div>

      <div className="form-group">
        <label htmlFor="price">Precio:</label>
        <input
          id="price"
          type="number"
          placeholder="Precio (ej: 12.50)"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
          min="0"
          step="0.01"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="stock">Stock:</label>
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
      </div>

      <div className="form-group">
        <label htmlFor="storeId">Tienda:</label>
        {isAdmin() ? (
          loadingStores ? (
            <p className="loading-message">Cargando tiendas...</p>
          ) : storesError ? (
            <p className="error-message">{storesError}</p>
          ) : stores.length > 0 ? (
            <select id="storeId" value={storeId} onChange={e => setStoreId(e.target.value)} required disabled={isSubmitting}>
              {stores.map(store => (
                <option key={store.storeId} value={store.storeId}>
                  {store.storeName} (ID: {store.storeId})
                </option>
              ))}
            </select>
          ) : (
            <p className="info-message">No hay tiendas disponibles para asignar.</p>
          )
        ) : (
          <p className="read-only-field">Tu tienda: <strong>{user?.storeId}</strong></p>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? (existingProduct ? "Actualizando..." : "Creando...") : (existingProduct ? "Actualizar" : "Crear")}
        </button>
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="cancel-button">
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default ProductForm;