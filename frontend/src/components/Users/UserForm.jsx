import React, { useState, useEffect } from "react";
import { createUser, updateUser, getAllStores } from "../../api/api";
import "../../Styles/UserForm.css";

const UserForm = ({ existingUser, onSave, onCancel, isOpen }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("vendedor");
  const [storeId, setStoreId] = useState("");
  const [stores, setStores] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingStores, setLoadingStores] = useState(true);
  const [storesError, setStoresError] = useState(null);
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

  // Effect to load the list of stores
  useEffect(() => {
    const loadStores = async () => {
      setLoadingStores(true);
      setStoresError(null);
      try {
        const res = await getAllStores();
        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        const storesArray = Array.isArray(data.stores) ? data.stores : data;
        setStores(storesArray);
        if (!existingUser && storesArray.length > 0) {
          setStoreId(storesArray[0].storeId);
        }
      } catch (err) {
        console.error("Failed to fetch stores:", err);
        setStoresError("Error al cargar la lista de tiendas.");
      } finally {
        setLoadingStores(false);
      }
    };
    loadStores();
  }, [existingUser]);

  // Effect to populate form fields when editing an existing user
  useEffect(() => {
    if (existingUser) {
      setEmail(existingUser.email);
      setRole(existingUser.role);
      setStoreId(existingUser.storeId);
      setPassword("");
    } else {
      setEmail("");
      setPassword("");
      setRole("vendedor");
      if (stores.length > 0) {
        setStoreId(stores[0].storeId);
      }
    }
    setMessage("");
  }, [existingUser, stores]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      let response;
      const userData = { email, role, storeId };

      if (password) {
        userData.password = password;
      }

      if (existingUser) {
        response = await updateUser({ ...userData, userId: existingUser.userId });
      } else {
        response = await createUser(userData);
      }

      if (response.ok) {
        setMessage(`Usuario ${existingUser ? "actualizado" : "creado"} exitosamente.`);
        onSave();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error desconocido');
      }
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      setMessage(`Error al guardar el usuario: ${error.message}`);
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {existingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
          </h3>
          <button className="modal-close" onClick={onCancel} type="button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="user-form">
          {message && (
            <div className={`form-message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          {/* Correo */}
          <div className="form-group">
            <label htmlFor="email">Correo:</label>
            <div className="input-container">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <div className="input-container">
              <input
                type="password"
                id="password"
                name="password"
                placeholder={existingUser ? "Nueva contraseña (opcional)" : "Contraseña"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!existingUser}
                disabled={isSubmitting}
              />
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {/* Rol */}
          <div className="form-group">
            <label htmlFor="role">Rol:</label>
            <div className="input-container">
              <select 
                id="role"
                name="role" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="vendedor">Vendedor</option>
                <option value="admin">Administrador</option>
              </select>
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="role-description">
              {role === 'admin' ? 'Acceso completo a todas las funciones' : 'Acceso limitado a su tienda asignada'}
            </div>
          </div>

          {/* Tienda */}
          <div className="form-group">
            <label htmlFor="storeId">Tienda:</label>
            {loadingStores ? (
              <div className="loading-message">Cargando tiendas...</div>
            ) : storesError ? (
              <div className="error-message">{storesError}</div>
            ) : stores.length === 0 ? (
              <div className="info-message">No hay tiendas disponibles.</div>
            ) : (
              <div className="input-container">
                <select 
                  id="storeId"
                  name="storeId" 
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
            )}
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button type="button" onClick={onCancel} disabled={isSubmitting} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="submit-button">
              {isSubmitting ? (existingUser ? "Actualizando..." : "Creando...") : (existingUser ? "Actualizar" : "Crear")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;