import { apiClient } from "./apiClient";
import { products as mockProducts } from "../data/data";

const LOCAL_PRODUCTS_KEY = "local_products_data";

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
    const firstImage = product.image || product.thumbnail || product.images ?.[0] || "";

    return {
        ...product,
        id,
        image: firstImage,
        images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [firstImage],
        reviewCount: product.reviewCount || product.numReviews || 0,
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
        const response = await apiClient.get(`/products${toQueryString(params)}`);

        return {
            products: extractProductList(response),
            page: response ?.page || response ?.data ?.page || 1,
            pages: response ?.pages || response ?.data ?.pages || 1,
            total: response ?.total || response ?.count || response ?.data ?.total || 0,
        };
    } catch (error) {
        if (!isNetworkError(error)) {
            throw error;
        }

        return localGetProducts(params);
    }
};

export const getFeaturedProducts = async() => {
    try {
        const response = await apiClient.get("/products/featured");
        return extractProductList(response);
    } catch (error) {
        if (!isNetworkError(error)) {
            throw error;
        }

        return readLocalProducts()
            .map(normalizeProduct)
            .filter(Boolean)
            .sort((a, b) => toNumber(b.reviewCount) - toNumber(a.reviewCount))
            .slice(0, 8);
    }
};

export const getTopRatedProducts = async() => {
    try {
        const response = await apiClient.get("/products/top-rated");
        return extractProductList(response);
    } catch (error) {
        if (!isNetworkError(error)) {
            throw error;
        }

        return readLocalProducts()
            .map(normalizeProduct)
            .filter(Boolean)
            .sort((a, b) => toNumber(b.rating) - toNumber(a.rating))
            .slice(0, 12);
    }
};

export const getProductById = async(id) => {
    try {
        const response = await apiClient.get(`/products/${id}`);
        const product = response ?.product || response ?.data ?.product || response ?.data || response;
        return normalizeProduct(product);
    } catch (error) {
        if (!isNetworkError(error)) {
            throw error;
        }

        const match = readLocalProducts().find((p) => String(p.id) === String(id));
        return normalizeProduct(match);
    }
};

export const createProduct = async(payload) => {
    try {
        const response = await apiClient.post("/products", payload, { auth: true });
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
            description: payload.description || "",
            shortFeatures: payload.shortFeatures || [],
            specs: payload.specs || {},
            colors: payload.colors || [],
            ...payload,
        });

        items.unshift(nextProduct);
        writeLocalProducts(items);
        return nextProduct;
    }
};

export const updateProduct = async(id, payload) => {
    try {
        const response = await apiClient.put(`/products/${id}`, payload, { auth: true });
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

            updatedItem = normalizeProduct({...item, ...payload, id: item.id });
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
