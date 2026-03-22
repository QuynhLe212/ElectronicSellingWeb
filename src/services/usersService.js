import { apiClient } from "./apiClient";

const LOCAL_AUTH_USER_KEY = "local_auth_user";
const CURRENT_USER_KEY = "user_data";

const isNetworkError = (error) => {
    if (!error) return false;
    const msg = String(error.message || "").toLowerCase();
    return msg.includes("khong the ket noi den may chu");
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const getUserFromStorage = (key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
        return null;
    }
};

const normalizeUser = (user, fallbackId = Date.now()) => {
    if (!user || typeof user !== "object") return null;

    const id = user._id || user.id || fallbackId;
    const email = String(user.email || "").trim();
    if (!email) return null;

    return {
        ...user,
        id,
        _id: user._id || id,
        name: user.name || user.fullName || "Người dùng",
        email,
        avatar: user.avatarUrl ||
            user.avatar ?.url ||
            `https://i.pravatar.cc/100?u=${encodeURIComponent(email)}`,
        role: user.role || "user",
    };
};

const getLocalUsers = () => {
    const currentUser = getUserFromStorage(CURRENT_USER_KEY);
    const localAuthUser = getUserFromStorage(LOCAL_AUTH_USER_KEY);
    const merged = [currentUser, localAuthUser]
        .map((user, index) => normalizeUser(user, Date.now() + index))
        .filter(Boolean);

    const seen = new Set();
    return merged.filter((user) => {
        const key = user.email.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const extractUsersResponse = (payload) => {
    const usersRaw =
        payload ?.users || payload ?.data ?.users || payload ?.data || payload || [];
    const users = toArray(usersRaw)
        .map((u, index) => normalizeUser(u, Date.now() + index))
        .filter(Boolean);

    return {
        users,
        pagination: {
            page: payload ?.pagination ?.page || payload ?.page || 1,
            limit: payload ?.pagination ?.limit || payload ?.limit || users.length || 1,
            totalPages: payload ?.pagination ?.totalPages || payload ?.pages || 1,
            total: payload ?.pagination ?.total ||
                payload ?.total ||
                payload ?.count ||
                users.length,
        },
    };
};

export const getUsersAdmin = async(params = {}) => {
    try {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") return;
            query.set(key, String(value));
        });

        const suffix = query.toString() ? `?${query.toString()}` : "";
        const response = await apiClient.get(`/users${suffix}`, { auth: true });
        return extractUsersResponse(response);
    } catch (error) {
        if (!isNetworkError(error)) {
            throw error;
        }

        const users = getLocalUsers();
        return {
            users,
            pagination: {
                page: 1,
                limit: users.length || 1,
                totalPages: 1,
                total: users.length,
            },
        };
    }
};