import { useState } from "react";

export default function AdminAddProduct({ addProduct, onCancel }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !price || !image) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: name,
      price: Number(price),
      image: image,
    };

    addProduct(newProduct);

    setName("");
    setPrice("");
    setImage("");
  };

  return (
    <form className="admin__form" onSubmit={handleSubmit}>
      <h3>Thêm sản phẩm</h3>

      {/* TÊN */}
      <input
        type="text"
        placeholder="Tên sản phẩm"
        value={name}
        required
        onChange={(e) => setName(e.target.value)}
      />

      {/* GIÁ */}
      <input
        type="number"
        placeholder="Giá sản phẩm"
        value={price}
        required
        onChange={(e) => setPrice(e.target.value)}
      />

      {/* HÌNH */}
      <input
        type="text"
        placeholder="Link hình ảnh"
        value={image}
        required
        onChange={(e) => setImage(e.target.value)}
      />

      {/* BUTTON */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button type="submit">Thêm</button>

        {onCancel && (
          <button type="button" onClick={onCancel}>
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
