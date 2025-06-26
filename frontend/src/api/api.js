const API_BASE = "";

//login
export const loginUser = (email, password) =>
  fetch(`/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

//users
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

//stores
export const createStore = (storeData) =>
  fetch(`${API_BASE}/create_store`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(storeData),
  });
  
export const getAllStores = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  return fetch(`${API_BASE}/get_all_stores`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-role": role
    }
  });
};

export const updateStore = (storeData) =>
  fetch(`${API_BASE}/update_store`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(storeData),
  });

export const deleteStore = (storeId) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  fetch(`${API_BASE}/delete_store?storeId=${storeId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-role": role
    }
  });
};