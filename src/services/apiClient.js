const API_BASE_URL =
    import.meta.env.VITE_API_URL || "/api";

const parseJsonResponse = async(response) => {
    if (response.status === 204) return {};
    return response.json().catch(() => ({}));
};

const getToken = () => localStorage.getItem("user_token");

const request = async(path, options = {}) => {
    const { method = "GET", body, headers = {}, auth = false, signal } = options;

    const mergedHeaders = {
        ...headers,
    };

    if (!(body instanceof FormData)) {
        mergedHeaders["Content-Type"] = "application/json";
    }

    if (auth) {
        const token = getToken();
        if (token) {
            mergedHeaders.Authorization = `Bearer ${token}`;
        }
    }

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers: mergedHeaders,
            body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
            signal,
        });
    } catch (error) {
        if (error && error.name === "AbortError") {
            throw new Error("Yeu cau da bi huy.");
        }

        throw new Error("Khong the ket noi den may chu. Vui long kiem tra backend va thu lai.");
    }

    const data = await parseJsonResponse(response);

    if (!response.ok) {
        const message = (data && data.message) || (data && data.error) || "Co loi xay ra, vui long thu lai.";
        throw new Error(message);
    }

    return data;
};

export const apiClient = {
    get: (path, options = {}) => request(path, {...options, method: "GET" }),
    post: (path, body, options = {}) => request(path, {...options, method: "POST", body }),
    put: (path, body, options = {}) => request(path, {...options, method: "PUT", body }),
    delete: (path, options = {}) => request(path, {...options, method: "DELETE" }),
};

export { API_BASE_URL };