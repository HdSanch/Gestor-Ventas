import React, { useEffect, useState, useCallback } from "react";
import { getAllUsers, deleteUser } from "../../api/api";
import UserForm from "./UserForm";
import "../../Styles/UserList.css";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
    setEditingUser(user);
    setShowForm(true);
  };

  const handleSaveComplete = () => {
    setShowForm(false);
    setEditingUser(null);
    loadUsers();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  // Función para filtrar usuarios por búsqueda
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.storeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estadísticas
  const totalUsers = filteredUsers.length;
  const activeUsers = filteredUsers.filter(user => user.isActive !== false).length; // Asumiendo que existe isActive
  const vendedores = filteredUsers.filter(user => user.role === 'vendedor').length;
  const admins = filteredUsers.filter(user => user.role === 'admin').length;

  // Función para obtener las iniciales del email
  const getInitials = (email) => {
    return email.charAt(0).toUpperCase();
  };

  // Función para obtener color del avatar basado en el rol
  const getAvatarColor = (role) => {
    switch (role) {
      case 'admin':
        return '#8b5cf6'; // Púrpura
      case 'vendedor':
        return '#ea580c'; // Naranja
      default:
        return '#6b7280'; // Gris
    }
  };

  return (
    <div className="user-list-container">
      {/* Header principal */}
      <div className="main-header">
        <div className="header-content">
          <h2>Gestión de Usuarios</h2>
          <p className="user-subtitle">Administra los usuarios del sistema</p>
        </div>
        <button 
          onClick={() => {
            setEditingUser(null);
            setShowForm(!showForm);
          }}
          className="toggle-form-button"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Nuevo Usuario
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon user-total">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="stat-value total-users">{totalUsers}</div>
          <div className="stat-label">Total Usuarios</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon vendedores">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="stat-value vendedores-count">{vendedores}</div>
          <div className="stat-label">Vendedores</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon admins">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="stat-value admins-count">{admins}</div>
          <div className="stat-label">Admins</div>
        </div>
      </div>

      {/* Modal del formulario */}
      <UserForm
        existingUser={editingUser}
        onSave={handleSaveComplete}
        onCancel={handleCancel}
        isOpen={showForm}
      />

      {/* Sección de lista */}
      <div className="list-section">
        <div className="section-title">Lista de Usuarios</div>
        
        {/* Controles de búsqueda */}
        <div className="list-header">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button onClick={loadUsers} className="refresh-button">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar Lista
          </button>
        </div>
        
        {/* Estados de carga y tabla */}
        {loading ? (
          <p className="state-message loading">Cargando usuarios...</p>
        ) : error ? (
          <p className="state-message error">{error}</p>
        ) : filteredUsers.length === 0 ? (
          <p className="state-message empty">
            {searchTerm ? "No se encontraron usuarios que coincidan con tu búsqueda." : "No hay usuarios para mostrar."}
          </p>
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
                {filteredUsers.map((u) => (
                  <tr key={u.userId}>
                    <td className="email-cell">
                      <div className="user-info">
                        <div 
                          className="user-avatar"
                          style={{ backgroundColor: getAvatarColor(u.role) }}
                        >
                          {getInitials(u.email)}
                        </div>
                        <span className="user-email">{u.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${u.role}`}>
                        {u.role === 'admin' ? 'Administrador' : 'Vendedor'}
                      </span>
                    </td>
                    <td>
                      <span className="store-id">{u.storeId === 'Todas' ? 'Todas' : u.storeId}</span>
                    </td>
                    <td className="actions-cell">
                      <button onClick={() => handleEdit(u)} className="edit-button">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(u.userId)} className="delete-button">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
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