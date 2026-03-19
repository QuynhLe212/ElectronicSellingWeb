import { apiClient } from "./apiClient";

const LOCAL_AUTH_USER_KEY = "local_auth_user";
const LOCAL_AUTH_PASSWORD_KEY = "local_auth_password";

const isNetworkError = (error) =>
  String(error?.message || "").toLowerCase().includes("khong the ket noi den may chu");

const getLocalAuthUser = () => {
  const raw = localStorage.getItem(LOCAL_AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const saveLocalAuthUser = (user, password) => {
  localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(user));
  if (password) {
    localStorage.setItem(LOCAL_AUTH_PASSWORD_KEY, password);
  }
};

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
  try {
    const data = await apiClient.post("/auth/login", { email, password });
    saveSession(data);
    return data;
  } catch (error) {
    if (!isNetworkError(error)) {
      throw error;
    }

    const localUser = getLocalAuthUser();
    const localPassword = localStorage.getItem(LOCAL_AUTH_PASSWORD_KEY);

    if (!localUser || localUser.email !== email || localPassword !== password) {
      throw new Error("Thong tin dang nhap khong dung.");
    }

    const data = {
      token: "local-demo-token",
      user: localUser,
    };
    saveSession(data);
    return data;
  }
};

export const register = async ({ name, email, phone, password }) => {
  try {
    const data = await apiClient.post("/auth/register", {
      name,
      email,
      phone,
      password,
    });
    saveSession(data);
    return data;
  } catch (error) {
    if (!isNetworkError(error)) {
      throw error;
    }

    const user = {
      id: Date.now(),
      name,
      email,
      phone,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    saveLocalAuthUser(user, password);

    const data = {
      token: "local-demo-token",
      user,
    };
    saveSession(data);
    return data;
  }
};

export const getMe = async () => {
  try {
    const data = await apiClient.get("/auth/me", { auth: true });
    if (data?.user) {
      localStorage.setItem("user_data", JSON.stringify(data.user));
      localStorage.setItem("user_email", data.user.email || "");
      localStorage.setItem("user_name", data.user.name || "");
      localStorage.setItem("user_role", data.user.role || "user");
    }
    return data;
  } catch (error) {
    if (!isNetworkError(error)) {
      throw error;
    }

    const localUser = getLocalAuthUser();
    if (!localUser) {
      throw new Error("Khong tim thay thong tin tai khoan local.");
    }

    return { user: localUser };
  }
};

export const updateMyProfile = async ({ name, phone, address }) => {
  try {
    const data = await apiClient.put(
      "/auth/profile",
      { name, phone, address },
      { auth: true },
    );

    if (data?.user) {
      localStorage.setItem("user_data", JSON.stringify(data.user));
      localStorage.setItem("user_email", data.user.email || "");
      localStorage.setItem("user_name", data.user.name || "");
      localStorage.setItem("user_role", data.user.role || "user");
    }

    return data;
  } catch (error) {
    if (!isNetworkError(error)) {
      throw error;
    }

    const currentUser = getLocalAuthUser();
    if (!currentUser) {
      throw new Error("Khong tim thay thong tin tai khoan local.");
    }

    const updatedUser = {
      ...currentUser,
      name: name || currentUser.name,
      phone: phone || currentUser.phone,
      address: address || currentUser.address,
    };

    saveLocalAuthUser(updatedUser);

    localStorage.setItem("user_data", JSON.stringify(updatedUser));
    localStorage.setItem("user_email", updatedUser.email || "");
    localStorage.setItem("user_name", updatedUser.name || "");
    localStorage.setItem("user_role", updatedUser.role || "user");

    return { user: updatedUser };
  }
};

export const changeMyPassword = async ({ currentPassword, newPassword }) => {
  try {
    return await apiClient.put(
      "/auth/change-password",
      { currentPassword, newPassword },
      { auth: true },
    );
  } catch (error) {
    if (!isNetworkError(error)) {
      throw error;
    }

    const localPassword = localStorage.getItem(LOCAL_AUTH_PASSWORD_KEY);
    if (localPassword && localPassword !== currentPassword) {
      throw new Error("Mat khau hien tai khong dung.");
    }

    localStorage.setItem(LOCAL_AUTH_PASSWORD_KEY, newPassword);
    return { message: "Doi mat khau thanh cong." };
  }
};

export const logout = async () => {
  return apiClient.post("/auth/logout", {}, { auth: true });
};
