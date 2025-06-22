import React, { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../../api/api";
import UserEditForm from "./UserEditForm";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const res = await getAllUsers();
    const data = await res.json();
    setUsers(data);
  };

  const handleDelete = async (userId) => {
    await deleteUser(userId);
    loadUsers();
  };

  return (
    <div>
      <h2>Lista de usuarios</h2>
      {editingUser ? (
        <UserEditForm user={editingUser} onCancel={() => setEditingUser(null)} onSave={loadUsers} />
      ) : (
        <table>
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
                <td>
                  <button onClick={() => setEditingUser(u)}>Editar</button>
                  <button onClick={() => handleDelete(u.userId)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserList;
