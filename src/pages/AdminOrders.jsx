import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import {
  deleteOrder,
  getOrderById,
  getOrdersAdmin,
  updateOrderStatus,
} from "../services/ordersService";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await getOrdersAdmin();
        if (ignore) return;
        setOrders(Array.isArray(response) ? response : []);
      } catch (error) {
        if (ignore) return;
        setErrorMessage(error.message || "Không thể tải đơn hàng.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadOrders();
    return () => {
      ignore = true;
    };
  }, []);

  const formatPrice = (price) => price.toLocaleString("vi-VN") + "₫";

  const statusLabelMap = {
    Pending: "Chờ xử lý",
    Processing: "Đang xử lý",
    Shipped: "Đang giao",
    Delivered: "Đã giao",
    Cancelled: "Đã hủy",
    Refunded: "Đã hoàn tiền",
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "status delivered";
      case "Shipped":
      case "Processing":
        return "status processing";
      case "Cancelled":
      case "Refunded":
        return "status cancelled";
      default:
        return "status pending";
    }
  };

  const handleViewOrder = async (order) => {
    try {
      const detail = await getOrderById(order._id);
      setSelectedOrder(detail || order);
    } catch {
      setSelectedOrder(order);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const updated = await updateOrderStatus(orderId, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, ...updated, status } : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, ...updated, status });
      }
    } catch (error) {
      alert(error.message || "Không thể cập nhật trạng thái đơn hàng.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      if (selectedOrder && selectedOrder._id === orderId) setSelectedOrder(null);
    } catch (error) {
      alert(error.message || "Không thể xóa đơn hàng.");
    }
  };

  return (
    <div className="admin">
      <AdminSidebar />
      <div className="admin__content">
        <h1 className="admin__title">Quản lý đơn hàng</h1>
        {isLoading && <p>Đang tải đơn hàng...</p>}
        {errorMessage && <p style={{ color: "var(--danger)" }}>{errorMessage}</p>}

        <div className="admin__card">
          <table className="admin__table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Ngày</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
                <th>Chi tiết</th>
                <th>Xóa</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <span className={getStatusClass(order.status)}>
                      {statusLabelMap[order.status] || order.status}
                    </span>
                  </td>
                  <td>{formatPrice(order.totalPrice)}</td>
                  <td>
                    <button onClick={() => handleViewOrder(order)}>Xem</button>
                  </td>
                  <td>
                    <button onClick={() => handleDeleteOrder(order._id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedOrder && (
          <div className="admin-modal">
            <div className="admin-modal-content">
              {/* Modal header */}
              <div className="modal-header">
                <h2>Chi tiết đơn hàng: {selectedOrder.orderNumber}</h2>
                <button className="modal-close" onClick={() => setSelectedOrder(null)}>
                  ✕
                </button>
              </div>

              {/* Order Info */}
              <div className="order-section">
                <h3>Thông tin đơn hàng</h3>
                <p>
                  <strong>Mã đơn:</strong> {selectedOrder.orderNumber}
                </p>
                <p>
                  <strong>Ngày tạo:</strong>{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                </p>
                <p>
                  <strong>Trạng thái:</strong>
                  <span
                    className={getStatusClass(selectedOrder.status)}
                    style={{ marginLeft: "8px" }}
                  >
                    {statusLabelMap[selectedOrder.status] || selectedOrder.status}
                  </span>
                </p>
              </div>

              {/* Shipping Info */}
              <div className="order-section">
                <h3>Thông tin giao hàng</h3>
                <p>
                  <strong>Người nhận:</strong> {selectedOrder.shippingAddress?.fullName}
                </p>
                <p>
                  <strong>Điện thoại:</strong> {selectedOrder.shippingAddress?.phone}
                </p>
                <p>
                  <strong>Địa chỉ:</strong>
                  {[
                    selectedOrder.shippingAddress?.address,
                    selectedOrder.shippingAddress?.ward,
                    selectedOrder.shippingAddress?.district,
                    selectedOrder.shippingAddress?.city,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p>
                  <strong>Ghi chú:</strong> {selectedOrder.shippingAddress?.note || "—"}
                </p>
              </div>

              {/* Payment Info */}
              <div className="order-section">
                <h3>Thông tin thanh toán</h3>
                <p>
                  <strong>Phương thức:</strong> {selectedOrder.paymentMethod}
                </p>
                <p>
                  <strong>Trạng thái thanh toán:</strong>{" "}
                  {selectedOrder.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                </p>
              </div>

              {/* Products */}
              <div className="order-section">
                <h3>Sản phẩm</h3>
                <div className="order-items">
                  {(selectedOrder.orderItems || []).map((item, idx) => (
                    <div className="order-item" key={idx}>
                      <img src={item.image} alt={item.name} className="item-image" />
                      <div className="item-info">
                        <p className="item-name">{item.name}</p>
                        <p className="item-qty">Số lượng: {item.quantity}</p>
                      </div>
                      <div className="item-price">{formatPrice(item.price)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Status Update */}
              <div className="order-section order-footer">
                <div className="total-box">
                  <span>Tổng tiền:</span>
                  <b>{formatPrice(selectedOrder.totalPrice)}</b>
                </div>

                <div className="status-update">
                  <label>Thay đổi trạng thái:</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                  >
                    {Object.keys(statusLabelMap).map((key) => (
                      <option key={key} value={key}>
                        {statusLabelMap[key]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
