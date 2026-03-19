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

export default function AdminProducts() {
  const [productList, setProductList] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    brand: "",
    category: "",
    image: "",
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
      price: "",
      brand: "",
      category: "",
      image: "",
    });
    setEditingProductId(null);
  };

  const onSubmitProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Nhập đủ thông tin");
      return;
    }

    const payload = {
      name: newProduct.name,
      price: Number(newProduct.price),
      brand: newProduct.brand,
      category: newProduct.category,
      image: newProduct.image,
      images: newProduct.image ? [newProduct.image] : [],
    };

    try {
      if (editingProductId) {
        const updated = await updateProduct(editingProductId, payload);
        setProductList((prev) =>
          prev.map((item) => (item.id === editingProductId ? { ...item, ...updated } : item)),
        );
      } else {
        const created = await createProduct(payload);
        setProductList((prev) => [created, ...prev]);
      }

      setShowForm(false);
      resetForm();
    } catch (error) {
      alert(error.message || "Không thể lưu sản phẩm.");
    }
  };

  const openEditForm = (product) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name || "",
      price: product.price || "",
      brand: product.brand || "",
      category: product.category || "",
      image: product.image || product.images?.[0] || "",
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
                    src={p.images?.[0] || p.image}
                    alt={p.name}
                    width="50"
                    style={{ borderRadius: "6px" }}
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
                placeholder="Link ảnh"
                value={newProduct.image}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    image: e.target.value,
                  })
                }
              />

              {newProduct.image && (
                <img
                  src={newProduct.image}
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
