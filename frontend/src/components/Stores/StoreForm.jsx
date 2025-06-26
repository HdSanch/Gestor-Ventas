import React, { useState, useEffect } from "react";
import { createStore, updateStore } from "../../api/api"; // Import updateStore
import "../../Styles/StoreForm.css"; // Assuming you have a CSS file for the form

const StoreForm = ({ existingStore, onSave, onCancel }) => { // Renamed onStoreCreated to onSave for consistency
  const [name, setName] = useState(""); // Use name for input, will map to storeName
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to populate form fields if editing an existing store
  useEffect(() => {
    if (existingStore) {
      setName(existingStore.storeName || "");
      setAddress(existingStore.address || "");
      setMessage(""); // Clear messages when switching to edit mode
    } else {
      // Reset form for new store creation
      setName("");
      setAddress("");
      setMessage("");
    }
  }, [existingStore]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      let res;
      const storeData = {
        storeName: name,
        address: address,
      };

      if (existingStore) {
        // If existingStore is provided, it's an update operation
        const updatedFields = { storeId: existingStore.storeId };
        if (name !== existingStore.storeName) {
          updatedFields.storeName = name;
        }
        if (address !== existingStore.address) {
          updatedFields.address = address;
        }

        if (Object.keys(updatedFields).length <= 1) { // Only storeId is present if no changes
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
        onSave?.(); // Notify parent to reload list
      } else {
        const errorData = await res.json();
        setMessage(`Error al ${existingStore ? "actualizar" : "crear"} la tienda: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Failed to save store:", error);
      setMessage("Error de conexión. Por favor, inténtelo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    onCancel?.(); // Call parent's cancel handler
  };

  return (
    <form onSubmit={handleSubmit} className="store-form">
      <h3>{existingStore ? "Editar Tienda" : "Crear Nueva Tienda"}</h3>
      <input
        type="text"
        name="storeName"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre"
        required
        disabled={isSubmitting}
      />
      <input
        type="text"
        name="address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Dirección"
        required
        disabled={isSubmitting}
      />
      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (existingStore ? "Actualizando..." : "Creando...") : (existingStore ? "Actualizar" : "Crear")}
        </button>
        <button type="button" onClick={handleCancel} disabled={isSubmitting}>
          Cancelar
        </button>
      </div>
      {message && <p className={message.startsWith("Error") ? "error-message" : ""}>{message}</p>}
    </form>
  );
};

export default StoreForm;