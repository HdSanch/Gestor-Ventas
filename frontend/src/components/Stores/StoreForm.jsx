import React, { useState } from "react";
import { createStore } from "../../api/api";

const StoreForm = ({ onStoreCreated, onCancel }) => {
  // Use state variables for 'name' and 'address'
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Add a state for submission status

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(""); // Clear any previous messages

    try {
      // 1. AHORA ENVIAMOS storeName en lugar de name.
      const storeDataToSend = {
        storeName: name, // <-- CAMBIO AQUÍ: Usamos storeName para el back-end
        address: address,
      };

      // 2. Enviamos el objeto con los nombres de campo correctos a la API.
      const res = await createStore(storeDataToSend);

      if (res.ok) {
        setMessage("Tienda creada correctamente.");
        setName(""); // Clear the input fields on success
        setAddress("");
        onStoreCreated?.(); // Reload the list of stores if the prop is provided
      } else {
        const errorData = await res.json();
        // El error ahora debería ser más claro si algo falla en la Lambda.
        setMessage(`Error al crear la tienda: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Failed to create store:", error);
      setMessage("Error de conexión. Por favor, inténtelo de nuevo.");
    } finally {
      setIsSubmitting(false); // Reset submission state
    }
  };
  
  // This function will be called when the Cancel button is clicked
  const handleCancel = () => {
    // You can clear the form and hide it, depending on your parent component's logic
    setName("");
    setAddress("");
    setMessage("");
    // If a cancel handler is provided, call it
    onCancel?.(); 
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Crear Tienda</h3>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre"
        required
        disabled={isSubmitting} // Disable inputs while submitting
      />
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Dirección"
        required
        disabled={isSubmitting} // Disable inputs while submitting
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creando..." : "Crear"}
      </button>
      {/* Add a button for canceling */}
      <button type="button" onClick={handleCancel} disabled={isSubmitting}>
        Cancelar
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default StoreForm;