const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
    throw new Error(message);
  }
  return data;
};

const getToken = () => localStorage.getItem("user_token");

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const saveSession = (payload) => {
  const { token, user } = payload;
  localStorage.setItem("user_token", token);
  localStorage.setItem("user_data", JSON.stringify(user));
  localStorage.setItem("user_email", user?.email || "");
  localStorage.setItem("user_name", user?.name || "");
  localStorage.setItem("user_role", user?.role || "user");
};

export const clearSession = () => {
  localStorage.removeItem("user_token");
  localStorage.removeItem("user_data");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_role");
};

export const login = async ({ email, password }) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await parseResponse(response);
  saveSession(data);
  return data;
};

export const register = async ({ name, email, phone, password }) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, phone, password }),
  });

  const data = await parseResponse(response);
  saveSession(data);
  return data;
};

export const getMe = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await parseResponse(response);
  if (data?.user) {
    localStorage.setItem("user_data", JSON.stringify(data.user));
    localStorage.setItem("user_email", data.user.email || "");
    localStorage.setItem("user_name", data.user.name || "");
    localStorage.setItem("user_role", data.user.role || "user");
  }
  return data;
};

export const updateMyProfile = async ({ name, phone, address }) => {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, phone, address }),
  });

  const data = await parseResponse(response);
  if (data?.user) {
    localStorage.setItem("user_data", JSON.stringify(data.user));
    localStorage.setItem("user_email", data.user.email || "");
    localStorage.setItem("user_name", data.user.name || "");
    localStorage.setItem("user_role", data.user.role || "user");
  }
  return data;
};
