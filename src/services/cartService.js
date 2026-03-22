const LEGACY_CART_KEY = "local_cart_items";
const GUEST_CART_KEY = "local_cart_items_guest";
const USER_CART_KEY_PREFIX = "local_cart_items_user_";
const CART_UPDATED_EVENT = "cart:updated";
const AUTH_SESSION_EVENT = "auth:session-changed";

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeProduct = (product = {}) => ({
    id: String(product.id || product._id || ""),
    name: String(product.name || "Sản phẩm"),
    price: toNumber(product.price, 0),
    image: String(
        product.image ||
        (Array.isArray(product.images) && product.images.length > 0 ?
            product.images[0] :
            "https://picsum.photos/seed/product-fallback/400/400"),
    ),
    stock: toNumber(product.stock, 999),
});

const normalizeCartItem = (item = {}) => {
    const product = normalizeProduct(item.product || item);
    const quantity = Math.max(1, Math.floor(toNumber(item.quantity, 1)));
    return { product, quantity };
};

const sanitizeKeyPart = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, "_");

const getCurrentUserIdentifier = () => {
    const userDataRaw = localStorage.getItem("user_data");
    if (userDataRaw) {
        try {
            const user = JSON.parse(userDataRaw);
            return sanitizeKeyPart((user && (user.id || user._id || user.email)) || "");
        } catch {
            return "";
        }
    }

    return sanitizeKeyPart(localStorage.getItem("user_email") || "");
};

const getActiveCartKey = () => {
    const userId = getCurrentUserIdentifier();
    if (userId) {
        return `${USER_CART_KEY_PREFIX}${userId}`;
    }

    return GUEST_CART_KEY;
};

const readRawCart = (key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const migrateLegacyGuestCart = () => {
    const legacyRaw = localStorage.getItem(LEGACY_CART_KEY);
    if (!legacyRaw) return;

    const guestExists = localStorage.getItem(GUEST_CART_KEY);
    if (!guestExists) {
        localStorage.setItem(GUEST_CART_KEY, legacyRaw);
    }

    localStorage.removeItem(LEGACY_CART_KEY);
};

const emitCartUpdated = () => {
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
};

const readCart = () => {
    migrateLegacyGuestCart();
    const key = getActiveCartKey();
    const parsed = readRawCart(key);

    return parsed
        .map(normalizeCartItem)
        .filter((item) => item.product.id);
};

const writeCart = (items) => {
    const key = getActiveCartKey();
    localStorage.setItem(key, JSON.stringify(items));
    emitCartUpdated();
};

export const getCartItems = () => readCart();

export const getCartCount = () => readCart().reduce((sum, item) => sum + item.quantity, 0);

export const addToCart = (product, quantity = 1) => {
    const productNormalized = normalizeProduct(product);
    if (!productNormalized.id) {
        throw new Error("Không thể thêm sản phẩm không hợp lệ vào giỏ hàng.");
    }

    const qtyToAdd = Math.max(1, Math.floor(toNumber(quantity, 1)));
    const cart = readCart();
    const index = cart.findIndex((item) => item.product.id === productNormalized.id);

    if (index >= 0) {
        const nextQty = cart[index].quantity + qtyToAdd;
        const maxStock = Math.max(1, toNumber(productNormalized.stock, 999));
        cart[index].quantity = Math.min(nextQty, maxStock);
        cart[index].product = {...cart[index].product, ...productNormalized };
    } else {
        cart.push({
            product: productNormalized,
            quantity: Math.min(qtyToAdd, Math.max(1, toNumber(productNormalized.stock, 999))),
        });
    }

    writeCart(cart);
    return cart;
};

export const updateCartItemQuantity = (productId, quantity) => {
    const id = String(productId || "");
    const cart = readCart();
    const nextQty = Math.floor(toNumber(quantity, 1));

    const updated = cart
        .map((item) => {
            if (item.product.id !== id) return item;
            const maxStock = Math.max(1, toNumber(item.product.stock, 999));
            return {
                ...item,
                quantity: Math.min(Math.max(1, nextQty), maxStock),
            };
        })
        .filter((item) => item.quantity > 0);

    writeCart(updated);
    return updated;
};

export const removeFromCart = (productId) => {
    const id = String(productId || "");
    const updated = readCart().filter((item) => item.product.id !== id);
    writeCart(updated);
    return updated;
};

export const clearCart = () => {
    const key = getActiveCartKey();
    localStorage.removeItem(key);
    emitCartUpdated();
};

export const subscribeCartChanges = (callback) => {
    const handler = () => callback(getCartItems());
    window.addEventListener("storage", handler);
    window.addEventListener(CART_UPDATED_EVENT, handler);
    window.addEventListener(AUTH_SESSION_EVENT, handler);

    return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener(CART_UPDATED_EVENT, handler);
        window.removeEventListener(AUTH_SESSION_EVENT, handler);
    };
};