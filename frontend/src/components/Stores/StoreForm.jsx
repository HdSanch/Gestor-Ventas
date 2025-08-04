import React, { useState, useEffect } from "react";
import { createStore, updateStore } from "../../api/api";
import "../../Styles/StoreForm.css";

const StoreForm = ({ existingStore, onSave, onCancel, isOpen }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Effect to populate form fields if editing an existing store
  useEffect(() => {
    if (existingStore) {
      setName(existingStore.storeName || "");
      setAddress(existingStore.address || "");
      setMessage("");
    } else {
      setName("");
      setAddress("");
      setMessage("");
    }
  }, [existingStore]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    // Validaciones básicas
    if (!name.trim() || !address.trim()) {
      setMessage("Por favor, completa todos los campos.");
      setIsSubmitting(false);
      return;
    }

    try {
      let res;
      const storeData = {
        storeName: name.trim(),
        address: address.trim(),
      };

      if (existingStore) {
        // If existingStore is provided, it's an update operation
        const updatedFields = { storeId: existingStore.storeId };
        if (name.trim() !== existingStore.storeName) {
          updatedFields.storeName = name.trim();
        }
        if (address.trim() !== existingStore.address) {
          updatedFields.address = address.trim();
        }

        if (Object.keys(updatedFields).length <= 1) {
          setMessage("No hay cambios para guardar.");
          setIsSubmitting(false);
          return;
        }
        res = await updateStore(updatedFields);
      } else {
        // Otherwise, it's a creation operation
        res = await createStore(storeData);
      }

      if (res.ok) {
        setMessage(`Tienda ${existingStore ? "actualizada" : "creada"} correctamente.`);
        onSave?.();
        if (!existingStore) {
          // Reset form for new store
          setName("");
          setAddress("");
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error desconocido');
      }
    } catch (error) {
      console.error("Failed to save store:", error);
      setMessage(`Error al ${existingStore ? "actualizar" : "crear"} la tienda: ${error.message}`);
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {existingStore ? "Editar Tienda" : "Crear Nueva Tienda"}
          </h3>
          <button className="modal-close" onClick={onCancel} type="button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="store-form">
          {message && (
            <div className={`form-message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          {/* Nombre de la tienda */}
          <div className="form-group">
            <label htmlFor="name">Nombre:</label>
            <div className="input-container">
              <input
                type="text"
                id="name"
                name="storeName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre"
                required
                disabled={isSubmitting}
              />
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          {/* Dirección */}
          <div className="form-group">
            <label htmlFor="address">Dirección:</label>
            <div className="input-container">
              <input
                type="text"
                id="address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Dirección"
                required
                disabled={isSubmitting}
              />
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          {/* Nota informativa */}
          {!existingStore && (
            <div className="info-note">
              <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Se generará automáticamente un ID único para la tienda.</span>
            </div>
          )}

          {/* Botones de acción */}
          <div className="form-actions">
            <button type="button" onClick={onCancel} disabled={isSubmitting} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="submit-button">
              {isSubmitting ? (existingStore ? "Actualizando..." : "Creando...") : (existingStore ? "Actualizar" : "Crear")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreForm;