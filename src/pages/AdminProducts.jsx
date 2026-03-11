import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { products, categories, brands } from "../data/data";
import { FiTrash2, FiPlus } from "react-icons/fi";

export default function AdminProducts() {
  const [productList, setProductList] = useState(products);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    brand: "",
    category: "",
    image: "",
  });

  const formatPrice = (price) => Number(price).toLocaleString("vi-VN") + "₫";

  const deleteProduct = (id) => {
    if (window.confirm("Bạn có chắc muốn xoá sản phẩm?")) {
      setProductList(productList.filter((p) => p.id !== id));
    }
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Nhập đủ thông tin");
      return;
    }

    const product = {
      id: Date.now(),
      name: newProduct.name,
      price: Number(newProduct.price),
      brand: newProduct.brand,
      category: newProduct.category,
      image: newProduct.image,
      images: [newProduct.image],
      rating: 0,
      reviewCount: 0,
      originalPrice: null,
    };

    setProductList([...productList, product]);

    setShowForm(false);

    setNewProduct({
      name: "",
      price: "",
      brand: "",
      category: "",
      image: "",
    });
  };

  const filtered = productList.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="admin">
      <AdminSidebar />

      <div className="admin__content">
        <h1 className="admin__title">Quản lý sản phẩm</h1>

        {/* TOOLBAR */}
        <div className="admin__toolbar">
          <input
            className="admin__search"
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="admin__add" onClick={() => setShowForm(true)}>
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
                  <button
                    className="admin__delete"
                    onClick={() => deleteProduct(p.id)}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* MODAL ADD PRODUCT */}
        {showForm && (
          <div className="admin__modal">
            <div className="admin__form">
              <h2>Thêm sản phẩm</h2>

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
                <button onClick={addProduct}>Lưu</button>

                <button onClick={() => setShowForm(false)}>Hủy</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
