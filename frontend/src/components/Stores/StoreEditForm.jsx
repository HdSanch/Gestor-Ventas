import React, { useState, useEffect } from "react";
import { updateStore } from "../../api/api";
import "../../Styles/StoreEditForm.css"; // Import the CSS file

const StoreEditForm = ({ store, onCancel, onSave }) => {
  // Inicializamos los estados con los valores de la tienda recibida.
  // Usamos 'storeName' y 'address' para mayor claridad.
  // Asegúrate de que el objeto 'store' que recibes tenga estos campos.
  const [storeName, setStoreName] = useState(store?.storeName || "");
  const [address, setAddress] = useState(store?.address || "");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincronizamos los estados si el objeto 'store' cambia.
  useEffect(() => {
    if (store) {
      setStoreName(store.storeName);
      setAddress(store.address);
      // Limpia el mensaje si se cambia la tienda a editar
      setMessage("");
    }
  }, [store]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Limpiamos el mensaje antes de la nueva solicitud.
    setIsSubmitting(true); // Desactivamos el botón para evitar envíos múltiples.

    // Creamos un objeto con solo los campos que han sido modificados.
    const updatedFields = {
      // Siempre incluimos el storeId para saber qué tienda actualizar
      storeId: store.storeId, 
    };

    // Solo incluimos los campos que realmente cambiaron.
    // Esto evita enviar datos innecesarios a la API.
    if (storeName !== store.storeName) {
      updatedFields.storeName = storeName;
    }
    if (address !== store.address) {
      updatedFields.address = address;
    }

    // Verificamos si hay al menos un cambio para enviar
    if (Object.keys(updatedFields).length <= 1) { // 1 porque storeId siempre está
      setMessage("No hay cambios para guardar.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Llamamos a la API de actualización con el ID y los campos actualizados.
      const res = await updateStore(updatedFields);

      if (res.ok) {
        setMessage("Tienda actualizada correctamente.");
        // Notificamos al componente padre para que actualice la lista.
        onSave();
        // Cerramos el formulario de edición.
        onCancel();
      } else {
        const errorData = await res.json();
        setMessage(`Error al actualizar la tienda: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error en la solicitud de actualización:", error);
      setMessage("Error de conexión. Intenta de nuevo más tarde.");
    } finally {
      setIsSubmitting(false); // Volvemos a habilitar el botón.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="store-edit-form">
      <h3>Editar Tienda</h3>
      <input
        type="text"
        placeholder="Nombre de la tienda"
        value={storeName}
        onChange={(e) => setStoreName(e.target.value)}
        disabled={isSubmitting}
      />
      <input
        type="text"
        placeholder="Dirección"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        disabled={isSubmitting}
      />
      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </button>
      </div>
      {message && <p>{message}</p>}
    </form>
  );
};

export default StoreEditForm;