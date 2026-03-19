import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { categories, brands } from "../data/data";
import { FiTrash2, FiPlus, FiEdit2 } from "react-icons/fi";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../services/productsService";

const PRODUCT_FALLBACK_IMAGE = "https://picsum.photos/seed/product-fallback/200/200";

const getImageUrl = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value.url || value.src || "";
  return "";
};

const withFallbackImage = (event) => {
  const image = event.currentTarget;
  image.onerror = null;
  image.src = PRODUCT_FALLBACK_IMAGE;
};

export default function AdminProducts() {
  const [productList, setProductList] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "10",
    brand: "",
    category: "",
    imageFiles: [],
    imagePreview: "",
  });

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await getProducts({ page: 1, limit: 500, sort: "-createdAt" });
        if (ignore) return;
        setProductList(response.products || []);
      } catch (error) {
        if (ignore) return;
        setErrorMessage(error.message || "Không thể tải sản phẩm.");
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      ignore = true;
    };
  }, []);

  const formatPrice = (price) => Number(price).toLocaleString("vi-VN") + "₫";

  const onDeleteProduct = async (id) => {
    if (window.confirm("Bạn có chắc muốn xoá sản phẩm?")) {
      try {
        await deleteProduct(id);
        setProductList((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        alert(error.message || "Không thể xóa sản phẩm.");
      }
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      description: "",
      price: "",
      stock: "10",
      brand: "",
      category: "",
      imageFiles: [],
      imagePreview: "",
    });
    setEditingProductId(null);
  };

  const onSubmitProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert("Nhập đủ thông tin");
      return;
    }

    if (!editingProductId && newProduct.imageFiles.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ảnh sản phẩm");
      return;
    }

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description || "Sản phẩm mới");
    formData.append("price", String(Number(newProduct.price)));
    formData.append("stock", String(Number(newProduct.stock || 0)));
    formData.append("brand", newProduct.brand || "");
    formData.append("category", newProduct.category);

    newProduct.imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      if (editingProductId) {
        const updated = await updateProduct(editingProductId, formData);
        setProductList((prev) =>
          prev.map((item) => (item.id === editingProductId ? { ...item, ...updated } : item)),
        );
      } else {
        const created = await createProduct(formData);
        setProductList((prev) => [created, ...prev]);
      }

      setShowForm(false);
      resetForm();
    } catch (error) {
      alert(error.message || "Không thể lưu sản phẩm.");
    }
  };

  const openEditForm = (product) => {
    const firstImage = getImageUrl(product.image) || getImageUrl(product.images?.[0]) || "";
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "0",
      brand: product.brand || "",
      category: product.category || "",
      imageFiles: [],
      imagePreview: firstImage,
    });
    setShowForm(true);
  };

  const filtered = productList.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="admin">
      <AdminSidebar />

      <div className="admin__content">
        <h1 className="admin__title">Quản lý sản phẩm</h1>

        {isLoading && <p>Đang tải sản phẩm...</p>}
        {errorMessage && <p style={{ color: "var(--danger)" }}>{errorMessage}</p>}

        {/* TOOLBAR */}
        <div className="admin__toolbar">
          <input
            className="admin__search"
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="admin__add"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <FiPlus /> Thêm sản phẩm
          </button>
        </div>

        {/* TABLE */}
        <table className="admin__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Giá</th>
              <th>Rating</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>

                <td>
                  <img
                    src={getImageUrl(p.images?.[0]) || getImageUrl(p.image) || PRODUCT_FALLBACK_IMAGE}
                    alt={p.name}
                    width="50"
                    style={{ borderRadius: "6px" }}
                    onError={withFallbackImage}
                  />
                </td>

                <td>{p.name}</td>

                <td>{p.brand}</td>

                <td>{p.category}</td>

                <td>{formatPrice(p.price)}</td>

                <td>⭐ {p.rating}</td>

                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="admin__delete"
                      onClick={() => openEditForm(p)}
                      title="Sửa sản phẩm"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="admin__delete"
                      onClick={() => onDeleteProduct(p.id)}
                      title="Xóa sản phẩm"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* MODAL ADD PRODUCT */}
        {showForm && (
          <div className="admin__modal">
            <div className="admin__form">
              <h2>{editingProductId ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}</h2>

              <input
                placeholder="Tên sản phẩm"
                value={newProduct.name}
                required
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    name: e.target.value,
                  })
                }
              />

              <input
                placeholder="Mô tả sản phẩm"
                value={newProduct.description}
                required
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    description: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Giá"
                value={newProduct.price}
                required
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Tồn kho"
                value={newProduct.stock}
                required
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    stock: e.target.value,
                  })
                }
              />

              {/* BRAND */}
              <select
                value={newProduct.brand}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    brand: e.target.value,
                  })
                }
              >
                <option value="">Chọn brand</option>

                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              {/* CATEGORY */}
              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    category: e.target.value,
                  })
                }
              >
                <option value="">Chọn category</option>

                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const preview = files.length > 0 ? URL.createObjectURL(files[0]) : newProduct.imagePreview;

                  setNewProduct({
                    ...newProduct,
                    imageFiles: files,
                    imagePreview: preview,
                  });
                }}
              />

              {newProduct.imagePreview && (
                <img
                  src={newProduct.imagePreview}
                  alt="preview"
                  style={{
                    width: "120px",
                    marginTop: "10px",
                    borderRadius: "6px",
                  }}
                />
              )}

              <div className="form-actions">
                <button onClick={onSubmitProduct}>Lưu</button>

                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
