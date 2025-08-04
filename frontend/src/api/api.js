// const API_BASE = "";
const API_BASE = process.env.REACT_APP_API_BASE;

//login
export const loginUser = (email, password) =>
  fetch(`${API_BASE}/login`, {
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
  console.log("getAllStores - Value of x-role header:", role); 

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

//products

export const getAllProducts = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const storeId = user?.storeId; 

  const query = role === "vendedor" && storeId ? `?storeId=${storeId}` : '';
  
  return fetch(`${API_BASE}/get_all_products${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-role": role,
    },
  });
};

export const createProduct = (product) =>
  fetch(`${API_BASE}/create_product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });

export const updateProduct = (product) =>
  fetch(`${API_BASE}/update_product`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });

export const deleteProduct = (productId) => {
  return fetch(`${API_BASE}/delete_product?productId=${productId}`, {
    method: "DELETE"
  });
};

// sales

export const getSales = (role, storeId) => {
  const query = role === "admin" ? `role=admin` : `role=vendedor&storeId=${storeId}`;
  return fetch(`${API_BASE}/get_all_sales?${query}`);
};

export const createSale = (saleData) =>
  fetch(`${API_BASE}/create_sale`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(saleData),
  });

export const updateSale = (saleData) =>
  fetch(`${API_BASE}/sales`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(saleData),
  });

export const deleteSale = (saleId) =>
  fetch(`${API_BASE}/delete_sale?saleId=${saleId}`, {
    method: "DELETE"
  });

  export const getProductsByStore = (storeId) =>
  fetch(`${API_BASE}/get_prd_store?storeId=${storeId}`);
