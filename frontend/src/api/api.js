const API_BASE = "";

export const loginUser = (email, password) =>
  fetch(`/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

export const getUsersByStore = (storeId) =>
  fetch(`/users/by-store?storeId=${storeId}`);

export const createUser = (userData) =>
  fetch(`${API_BASE}/create_user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

export const getAllUsers = () =>
  fetch(`${API_BASE}/get_all_users`, {
    method: "GET"
  });

export const updateUser = (userData) =>
  fetch(`${API_BASE}/update_user`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

export const deleteUser = (userId) =>
  fetch(`${API_BASE}/delete_user?userId=${userId}`, {
    method: "DELETE",
  });