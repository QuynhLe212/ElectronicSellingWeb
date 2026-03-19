import { apiClient, API_BASE_URL } from "./apiClient";
import { products as mockProducts } from "../data/data";

const LOCAL_PRODUCTS_KEY = "local_products_data";
const DEFAULT_PRODUCT_IMAGE = "https://picsum.photos/seed/product-placeholder/800/800";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const UI_TO_API_CATEGORY = {
    smartphones: "Phone",
    laptops: "Laptop",
    audio: "Other",
    cameras: "Other",
    tablets: "Tablet",
    accessories: "Accessory",
};

const API_TO_UI_CATEGORY = {
    Phone: "smartphones",
    Laptop: "laptops",
    Tablet: "tablets",
    Accessory: "accessories",
    Monitor: "accessories",
    PC: "laptops",
    Gaming: "laptops",
    Other: "accessories",
};

const isNetworkError = (error) =>
    String(error ?.message || "").toLowerCase().includes("khong the ket noi den may chu");

const toQueryString = (params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        query.set(key, String(value));
    });

    const text = query.toString();
    return text ? `?${text}` : "";
};

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const toApiCategory = (category) => {
    if (!category) return "";
    return UI_TO_API_CATEGORY[category] || category;
};

const toUiCategory = (category) => {
    if (!category) return "";
    return API_TO_UI_CATEGORY[category] || category;
};

const toPlainObject = (value) => {
    if (!value || typeof value !== "object") return {};
    if (value instanceof Map) {
        return Object.fromEntries(value);
    }
    return value;
};

const extractImageUrl = (image) => {
    if (!image) return "";
    if (typeof image === "string") {
        if (image.startsWith("/uploads/")) {
            return `${API_ORIGIN}${image}`;
        }
        return image;
    }
    if (typeof image === "object") {
        const url = image.url || image.src || image.secure_url || "";
        if (typeof url === "string" && url.startsWith("/uploads/")) {
            return `${API_ORIGIN}${url}`;
        }
        return url;
    }
    return "";
};

const mapPayloadCategory = (payload) => {
    if (payload instanceof FormData) {
        const raw = payload.get("category");
        const mapped = toApiCategory(raw);
        if (mapped) {
            payload.set("category", mapped);
        }
        return payload;
    }

    if (payload && typeof payload === "object") {
        return {
            ...payload,
            category: toApiCategory(payload.category),
        };
    }

    return payload;
};

const payloadToObject = (payload) => {
    if (payload instanceof FormData) {
        const result = {};
        for (const [key, value] of payload.entries()) {
            if (key === "images") continue;
            result[key] = value;
        }
        return result;
    }

    if (payload && typeof payload === "object") {
        return payload;
    }

    return {};
};

const readLocalProducts = () => {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (!raw) {
        const seed = mockProducts.map((p) => ({...p }));
        localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(seed));
        return seed;
    }

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
    } catch {
        // Ignore parse error and reset local store below.
    }

    const resetSeed = mockProducts.map((p) => ({...p }));
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(resetSeed));
    return resetSeed;
};

const writeLocalProducts = (items) => {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(items));
};

const applyLocalProductFilters = (items, params = {}) => {
    const {
        category,
        search,
        minPrice,
        maxPrice,
        brand,
        sort = "-createdAt",
        page = 1,
        limit = 12,
    } = params;

    let result = [...items];

    if (category) {
        result = result.filter((p) => String(p.category || "") === String(category));
    }

    if (search) {
        const q = String(search).toLowerCase();
        result = result.filter(
            (p) =>
            String(p.name || "").toLowerCase().includes(q) ||
            String(p.description || "").toLowerCase().includes(q)
        );
    }

    if (brand) {
        result = result.filter((p) => String(p.brand || "") === String(brand));
    }

    const min = minPrice === undefined || minPrice === "" ? null : toNumber(minPrice, null);
    const max = maxPrice === undefined || maxPrice === "" ? null : toNumber(maxPrice, null);

    if (min !== null) {
        result = result.filter((p) => toNumber(p.price) >= min);
    }

    if (max !== null) {
        result = result.filter((p) => toNumber(p.price) <= max);
    }

    switch (sort) {
        case "price":
            result.sort((a, b) => toNumber(a.price) - toNumber(b.price));
            break;
        case "-price":
            result.sort((a, b) => toNumber(b.price) - toNumber(a.price));
            break;
        case "-rating":
            result.sort((a, b) => toNumber(b.rating) - toNumber(a.rating));
            break;
        case "rating":
            result.sort((a, b) => toNumber(a.rating) - toNumber(b.rating));
            break;
        case "createdAt":
            result.sort((a, b) => toNumber(a.id) - toNumber(b.id));
            break;
        case "-createdAt":
        default:
            result.sort((a, b) => toNumber(b.id) - toNumber(a.id));
            break;
    }

    const pageNumber = Math.max(1, toNumber(page, 1));
    const pageSize = Math.max(1, toNumber(limit, 12));
    const total = result.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const start = (Math.min(pageNumber, pages) - 1) * pageSize;
    const paged = result.slice(start, start + pageSize);

    return {
        products: paged,
        page: Math.min(pageNumber, pages),
        pages,
        total,
    };
};

const normalizeProduct = (product) => {
    if (!product) return null;

    const id = product.id || product._id;
    const normalizedImages = Array.isArray(product.images)
        ? product.images.map(extractImageUrl).filter(Boolean)
        : [];
    const firstImage =
        extractImageUrl(product.image) ||
        extractImageUrl(product.thumbnail) ||
        normalizedImages[0] ||
        DEFAULT_PRODUCT_IMAGE;
    const shortFeatures = Array.isArray(product.shortFeatures)
        ? product.shortFeatures
        : Array.isArray(product.features)
            ? product.features
            : [];
    const specs = toPlainObject(product.specs || product.specifications);
    const colors = Array.isArray(product.colors) ? product.colors : [];
    const rating = toNumber(product.rating, 0);
    const price = toNumber(product.price, 0);
    const originalPrice = product.originalPrice == null ? null : toNumber(product.originalPrice, null);
    const reviewCount =
        toNumber(product.reviewCount, NaN) ||
        toNumber(product.numReviews, NaN) ||
        (Array.isArray(product.reviews) ? product.reviews.length : 0);
    const discount =
        toNumber(product.discount, NaN) ||
        (Number.isFinite(originalPrice) && originalPrice > price
            ? Math.round(((originalPrice - price) / originalPrice) * 100)
            : 0);
    const badge = product.badge || (product.isFeatured ? "new" : null);

    return {
        ...product,
        id,
        category: toUiCategory(product.category),
        rating,
        price,
        originalPrice,
        badge,
        discount,
        image: firstImage,
        images: normalizedImages.length > 0 ? normalizedImages : [firstImage],
        reviewCount,
        shortFeatures,
        specs,
        colors,
    };
};

const extractProductList = (payload) => {
    const raw = payload ?.products || payload ?.data ?.products || payload ?.data || [];
    if (!Array.isArray(raw)) return [];
    return raw.map(normalizeProduct).filter(Boolean);
};

const localGetProducts = (params = {}) => {
    const items = readLocalProducts().map(normalizeProduct).filter(Boolean);
    return applyLocalProductFilters(items, params);
};

export const getProducts = async(params = {}) => {
    try {
        const requestParams = {
            ...params,
            category: toApiCategory(params.category),
        };
        const response = await apiClient.get(`/products${toQueryString(requestParams)}`);

        return {
            products: extractProductList(response),
            page: response ?.page || response ?.pagination ?.page || response ?.data ?.page || 1,
            pages:
                response ?.pages ||
                response ?.pagination ?.totalPages ||
                response ?.data ?.pages ||
                1,
            total:
                response ?.total ||
                response ?.count ||
                response ?.pagination ?.totalProducts ||
                response ?.data ?.total ||
                0,
        };
    } catch (error) {
            throw error;
    }
};

export const getFeaturedProducts = async() => {
    try {
        const response = await apiClient.get("/products/featured");
        return extractProductList(response);
    } catch (error) {
        throw error;
    }
};

export const getTopRatedProducts = async() => {
    try {
        const response = await apiClient.get("/products/top-rated");
        return extractProductList(response);
    } catch (error) {
        throw error;
    }
};

export const getProductById = async(id) => {
    try {
        const response = await apiClient.get(`/products/${id}`);
        const product = response ?.product || response ?.data ?.product || response ?.data || response;
        return normalizeProduct(product);
    } catch (error) {
        throw error;
    }
};

export const createProduct = async(payload) => {
    const requestPayload = mapPayloadCategory(payload);
    const payloadObject = payloadToObject(requestPayload);

    try {
        const response = await apiClient.post("/products", requestPayload, { auth: true });
        const product = response ?.product || response ?.data ?.product || response ?.data || response;
        return normalizeProduct(product);
    } catch (error) {
        if (!isNetworkError(error)) {
            throw error;
        }

        const items = readLocalProducts();
        const nextProduct = normalizeProduct({
            id: Date.now(),
            rating: 0,
            reviewCount: 0,
            originalPrice: null,
            badge: null,
            discount: 0,
            description: payloadObject.description || "",
            shortFeatures: payloadObject.shortFeatures || [],
            specs: payloadObject.specs || {},
            colors: payloadObject.colors || [],
            ...payloadObject,
        });

        items.unshift(nextProduct);
        writeLocalProducts(items);
        return nextProduct;
    }
};

export const updateProduct = async(id, payload) => {
    const requestPayload = mapPayloadCategory(payload);
    const payloadObject = payloadToObject(requestPayload);

    try {
        const response = await apiClient.put(`/products/${id}`, requestPayload, { auth: true });
        const product = response ?.product || response ?.data ?.product || response ?.data || response;
        return normalizeProduct(product);
    } catch (error) {
        if (!isNetworkError(error)) {
            throw error;
        }

        const items = readLocalProducts();
        let updatedItem = null;

        const updatedItems = items.map((item) => {
            if (String(item.id) !== String(id)) {
                return item;
            }

            updatedItem = normalizeProduct({...item, ...payloadObject, id: item.id });
            return updatedItem;
        });

        writeLocalProducts(updatedItems);
        return updatedItem;
    }
};

export const deleteProduct = async(id) => {
    try {
        return await apiClient.delete(`/products/${id}`, { auth: true });
    } catch (error) {
        if (!isNetworkError(error)) {
            throw error;
        }

        const items = readLocalProducts();
        const filtered = items.filter((item) => String(item.id) !== String(id));
        writeLocalProducts(filtered);
        return { success: true };
    }
};

export const addProductReview = async(id, payload) => {
    try {
        return await apiClient.post(`/products/${id}/reviews`, payload, { auth: true });
    } catch (error) {
        if (!isNetworkError(error)) {
            throw error;
        }

        const items = readLocalProducts();
        const currentUser = JSON.parse(localStorage.getItem("user_data") || "{}");
        let updatedProduct = null;

        const updatedItems = items.map((item) => {
            if (String(item.id) !== String(id)) {
                return item;
            }

            const reviews = Array.isArray(item.reviews) ? [...item.reviews] : [];
            const nextReview = {
                id: Date.now(),
                rating: toNumber(payload ?.rating, 0),
                comment: payload ?.comment || "",
                user: {
                    name: currentUser ?.name || "Khach hang",
                },
                createdAt: new Date().toISOString(),
            };
            reviews.unshift(nextReview);

            const totalRating = reviews.reduce((sum, r) => sum + toNumber(r.rating, 0), 0);
            const nextReviewCount = reviews.length;
            const nextRating = nextReviewCount > 0 ? Number((totalRating / nextReviewCount).toFixed(1)) : 0;

            updatedProduct = {
                ...item,
                reviews,
                reviewCount: nextReviewCount,
                rating: nextRating,
            };

            return updatedProduct;
        });

        writeLocalProducts(updatedItems);
        return {
            message: "Them danh gia thanh cong.",
            product: normalizeProduct(updatedProduct),
        };
    }
};
