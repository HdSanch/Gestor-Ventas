import React, { useEffect, useState, useCallback } from "react";
import { getAllUsers, deleteUser } from "../../api/api";
import UserForm from "./UserForm";
import "../../Styles/UserList.css";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false); // State to control form visibility

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllUsers();
      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      const usersArray = Array.isArray(data.users) ? data.users : data;
      setUsers(usersArray);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Error al cargar los usuarios. Por favor, inténtelo de nuevo.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateNewUser = () => {
    setEditingUser(null); // Clear any editing state to open the form for creation
    setShowForm(true); // Show the form
  };

  const handleDelete = async (userId) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar al usuario con ID ${userId}?`)) {
      return;
    }
    try {
      const res = await deleteUser(userId);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error desconocido al eliminar el usuario.');
      }
      loadUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert(`Error al eliminar el usuario: ${err.message}`);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user); // Set the user to be edited
    setShowForm(true); // Show the form for editing
  };

  const handleSaveComplete = () => {
    setShowForm(false); // Hide the form after a successful save
    setEditingUser(null); // Reset editing state
    loadUsers(); // Reload the list to see changes
  };

  const handleCancel = () => {
    setShowForm(false); // Hide the form on cancel
    setEditingUser(null); // Reset editing state
  };

  return (
    <div className="user-list-container">
      <h2>Gestión de Usuarios</h2>
      
      {/* CORRECCIÓN: Se cambió la lógica del botón para que funcione como un toggle.
        Ahora, al hacer clic, alterna la visibilidad del formulario.
      */}
      <button 
        onClick={() => {
          setShowForm(!showForm);
          if (showForm) { // If the form is currently visible
            setEditingUser(null); // Clear editing state when hiding
          } else { // If the form is currently hidden
            setEditingUser(null); // Clear editing state when showing for creation
          }
        }} 
        className="toggle-form-button"
      >
        {showForm ? "Ocultar Formulario" : "Crear Nuevo Usuario"}
      </button>

      {/* Conditionally render the UserForm for creation/editing */}
      {showForm && (
        <div className="form-section">
          <UserForm
            existingUser={editingUser}
            onSave={handleSaveComplete}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div className="list-section">
        <div className="list-header">
          <h3>Lista de Usuarios</h3>
          <button onClick={loadUsers} className="refresh-button">
            Actualizar Lista
          </button>
        </div>

        {loading ? (
          <p className="state-message loading">Cargando usuarios...</p>
        ) : error ? (
          <p className="state-message error">{error}</p>
        ) : users.length === 0 ? (
          <p className="state-message empty">No hay usuarios para mostrar.</p>
        ) : (
          <div className="table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Tienda</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.userId}>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.storeId}</td>
                    <td className="actions-cell">
                      <button onClick={() => handleEdit(u)} className="edit-button">Editar</button>
                      <button onClick={() => handleDelete(u.userId)} className="delete-button">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;