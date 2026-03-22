import { apiClient } from "./apiClient";
import { mockOrders } from "../data/data";

const LOCAL_ORDERS_KEY = "local_orders_data";

const isNetworkError = (error) =>
    String(error ?.message || "").toLowerCase().includes("khong the ket noi den may chu");

const statusLabelMap = {
    pending: "Ch\u1edd x\u1eed l\u00fd",
    processing: "\u0110ang x\u1eed l\u00fd",
    shipping: "\u0110ang giao",
    delivered: "\u0110\u00e3 giao",
    cancelled: "\u0110\u00e3 h\u1ee7y",
};

const apiStatusMap = {
    pending: "Pending",
    processing: "Processing",
    shipping: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

const normalizeStatusValue = (status) => {
    const normalized = String(status || "").trim().toLowerCase();
    if (["pending", "cho xu ly", "cho xu li"].includes(normalized)) return "pending";
    if (["processing", "dang xu ly", "dang xu li"].includes(normalized)) return "processing";
    if (["shipping", "shipped", "dang giao"].includes(normalized)) return "shipping";
    if (["delivered", "da giao"].includes(normalized)) return "delivered";
    if (["cancelled", "canceled", "da huy"].includes(normalized)) return "cancelled";
    return "pending";
};

const isCorruptedVietnameseText = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return false;
    return /\uFFFD/.test(raw) || /Ã|Ä|á»|áº|á¸|Â/.test(raw);
};

const normalizeStatusLabel = (status, statusLabel) => {
    if (statusLabel) {
        const raw = String(statusLabel).trim();
        const lowerRaw = raw.toLowerCase();
        const normalized = raw
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        // Treat common mojibake patterns as corrupted text and recover from status value.
        if (isCorruptedVietnameseText(raw)) {
            return statusLabelMap[status] || statusLabelMap.pending;
        }

        if (["cho xu ly", "cho xu li", "pending"].includes(normalized)) {
            return statusLabelMap.pending;
        }
        if (["dang xu ly", "dang xu li", "processing"].includes(normalized)) {
            return statusLabelMap.processing;
        }
        if (["dang giao", "shipping", "shipped"].includes(normalized)) {
            return statusLabelMap.shipping;
        }
        if (["da giao", "delivered"].includes(normalized)) {
            return statusLabelMap.delivered;
        }
        if (["da huy", "da huy", "cancelled", "canceled"].includes(normalized)) {
            return statusLabelMap.cancelled;
        }

        if (Object.values(statusLabelMap).includes(raw)) {
            return raw;
        }

        if (apiStatusMap[status] && lowerRaw === apiStatusMap[status].toLowerCase()) {
            return statusLabelMap[status];
        }

        return statusLabel;
    }

    return statusLabelMap[status] || statusLabelMap.pending;
};

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const formatOrderCode = () => {
    const now = new Date();
    const year = now.getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ES-${year}-${rand}`;
};

const normalizeOrderItems = (order) => {
    const items = Array.isArray(order ?.items) ?
        order.items :
        Array.isArray(order ?.orderItems) ?
        order.orderItems : [];

    return items.map((item) => ({
        ...item,
        product: item.product || item.name,
        name: item.name || item.product,
        qty: item.qty || item.quantity || 1,
        quantity: item.quantity || item.qty || 1,
    }));
};

const readLocalOrders = () => {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) {
        const seed = mockOrders.map((order) => ({
            ...order,
            id: order.id || order._id,
            _id: order._id || order.id,
            createdAt: order.createdAt || new Date().toISOString(),
            orderItems: normalizeOrderItems(order),
            items: normalizeOrderItems(order),
            totalPrice: order.totalPrice || order.total || 0,
            total: order.total || order.totalPrice || 0,
            statusLabel: normalizeStatusLabel(order.status, order.statusLabel),
        }));
        localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(seed));
        return seed;
    }

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed;
        }
    } catch {
        // Ignore parse error and reset below.
    }

    localStorage.removeItem(LOCAL_ORDERS_KEY);
    return readLocalOrders();
};

const writeLocalOrders = (orders) => {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
};

const toOrder = (order) => ({
    ...order,
    id: order ?.id || order ?._id,
    _id: order ?._id || order ?.id,
    status: normalizeStatusValue(order ?.status),
    orderItems: normalizeOrderItems(order),
    items: normalizeOrderItems(order),
    total: toNumber(order ?.total || order ?.totalPrice, 0),
    totalPrice: toNumber(order ?.totalPrice || order ?.total, 0),
    statusLabel: normalizeStatusLabel(normalizeStatusValue(order ?.status), order ?.statusLabel),
});

const extractOrders = (payload) => {
    const raw = payload ?.orders || payload ?.data ?.orders || payload ?.data || [];
    if (!Array.isArray(raw)) return [];
    return raw.map(toOrder);
};

const extractOrdersMeta = (payload, orders) => ({
    pagination: {
        page: payload ?.pagination ?.page || payload ?.page || 1,
        limit: payload ?.pagination ?.limit || payload ?.limit || (orders.length || 1),
        totalPages: payload ?.pagination ?.totalPages || payload ?.pages || 1,
        totalOrders: payload ?.pagination ?.totalOrders ||
            payload ?.total ||
            payload ?.count ||
            orders.length,
    },
    statistics: {
        totalRevenue: toNumber(payload ?.statistics ?.totalRevenue, 0),
        averageOrderValue: toNumber(payload ?.statistics ?.averageOrderValue, 0),
    },
});

export const getOrdersAdmin = async(params = {}, options = {}) => {
    const { withMeta = false } = options;

    try {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") return;
            query.set(key, String(value));
        });

        const suffix = query.toString() ? `?${query.toString()}` : "";
        const response = await apiClient.get(`/orders${suffix}`, { auth: true });
        const orders = extractOrders(response);

        if (!withMeta) {
            return orders;
        }

        return {
            orders,
            ...extractOrdersMeta(response, orders),
        };
    } catch (error) {
        if (!isNetworkError(error)) {
            throw error;
        }

        const orders = readLocalOrders().map(toOrder);

        if (!withMeta) {
            return orders;
        }

        const totalRevenue = orders.reduce(
            (sum, order) => sum + toNumber(order.total || order.totalPrice, 0),
            0
        );

        return {
            orders,
            pagination: {
                page: 1,
                limit: orders.length || 1,
                totalPages: 1,
                totalOrders: orders.length,
            },
            statistics: {
                totalRevenue,
                averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
            },
        };
    }
};

export const createOrder = async(payload) => {
    try {
        const response = await apiClient.post("/orders", payload, { auth: true });
        const order = response ?.order || response ?.data ?.order || response ?.data || response;
        return toOrder(order);
    } catch (error) {
        if (!isNetworkError(error)) {
            throw error;
        }

        const currentUser = JSON.parse(localStorage.getItem("user_data") || "{}");
        const orders = readLocalOrders();
        const orderItems = (payload ?.orderItems || []).map((item) => ({
            ...item,
            product: item.product || item.name,
            name: item.name || item.product,
            qty: item.qty || item.quantity || 1,
            quantity: item.quantity || item.qty || 1,
        }));

        const now = new Date();
        const orderCode = formatOrderCode();
        const nextOrder = toOrder({
            id: orderCode,
            _id: orderCode,
            createdAt: now.toISOString(),
            date: now.toLocaleDateString("vi-VN"),
            status: "pending",
            statusLabel: statusLabelMap.pending,
            items: orderItems,
            orderItems,
            total: toNumber(payload ?.totalPrice || payload ?.total, 0),
            totalPrice: toNumber(payload ?.totalPrice || payload ?.total, 0),
            userEmail: currentUser ?.email || "",
            shippingAddress: payload ?.shippingAddress || {},
            paymentMethod: payload ?.paymentMethod || "card",
        });

        orders.unshift(nextOrder);
        writeLocalOrders(orders);
        return nextOrder;
    }
};

export const getMyOrders = async() => {
    try {
        const response = await apiClient.get("/orders/my-orders", { auth: true });
        return extractOrders(response);
    } catch (error) {
        if (!isNetworkError(error)) {
            throw error;
        }

        const currentUser = JSON.parse(localStorage.getItem("user_data") || "{}");
        const email = String(currentUser ?.email || "").toLowerCase();
        const allOrders = readLocalOrders().map(toOrder);

        if (!email) {
            return allOrders;
        }

        return allOrders.filter((order) => {
            const orderEmail = String(order ?.userEmail || order ?.user ?.email || "").toLowerCase();
            return !orderEmail || orderEmail === email;
        });
    }
};

export const getOrderById = async(id) => {
    try {
        const response = await apiClient.get(`/orders/${id}`, { auth: true });
        const order = response ?.order || response ?.data ?.order || response ?.data || response;
        return toOrder(order);
    } catch (error) {
        const message = String(error ?.message || "").toLowerCase();
        const shouldFallbackToLocal =
            isNetworkError(error) ||
            message.includes("validation failed") ||
            message.includes("invalid id") ||
            message.includes("invalid id format");

        if (!shouldFallbackToLocal) {
            throw error;
        }

        const found = readLocalOrders().find((order) => String(order.id || order._id) === String(id));
        return toOrder(found);
    }
};

export const updateOrderStatus = async(id, payload) => {
    try {
        const status = normalizeStatusValue(payload ?.status);
        const apiStatus = apiStatusMap[status] || "Pending";

        const response = await apiClient.put(`/orders/${id}/status`, {
            ...payload,
            status: apiStatus,
        }, { auth: true });
        const order = response ?.order || response ?.data ?.order || response ?.data || response;
        return toOrder(order);
    } catch (error) {
        if (!isNetworkError(error)) {
            throw error;
        }

        const orders = readLocalOrders();
        let updated = null;

        const updatedOrders = orders.map((order) => {
            if (String(order.id || order._id) !== String(id)) {
                return order;
            }

            updated = {
                ...order,
                status: normalizeStatusValue(payload ?.status || order.status),
                statusLabel: normalizeStatusLabel(normalizeStatusValue(payload ?.status || order.status), order.statusLabel),
            };

            return updated;
        });

        writeLocalOrders(updatedOrders);
        return toOrder(updated);
    }
};

export const deleteOrder = async(id) => {
    try {
        return await apiClient.delete(`/orders/${id}`, { auth: true });
    } catch (error) {
        if (!isNetworkError(error)) {
            throw error;
        }

        const orders = readLocalOrders();
        const filtered = orders.filter((order) => String(order.id || order._id) !== String(id));
        writeLocalOrders(filtered);
        return { success: true };
    }
};