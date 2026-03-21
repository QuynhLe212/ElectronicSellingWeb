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
  const [statusFeedback, setStatusFeedback] = useState({ type: "", text: "" });

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
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      ignore = true;
    };
  }, []);

  const formatPrice = (price) => price.toLocaleString("vi-VN") + "₫";

  const statusLabelMap = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };

  const getStatusLabel = (order) => {
    const status = order?.status;
    return statusLabelMap[status] || order?.statusLabel || "Chờ xử lý";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "delivered":
        return "status delivered";
      case "shipping":
        return "status shipping";
      case "cancelled":
        return "status cancelled";
      default:
        return "status";
    }
  };

  const handleViewOrder = async (order) => {
    setSelectedOrder(order);

    try {
      const detail = await getOrderById(order.id || order._id);
      if (detail) {
        setSelectedOrder((prev) => ({
          ...prev,
          ...detail,
        }));
      }
    } catch (error) {
      // Giữ dữ liệu từ danh sách nếu không lấy được chi tiết từ API.
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      setStatusFeedback({ type: "", text: "" });
      const updated = await updateOrderStatus(orderId, { status });
      setOrders((prev) =>
        prev.map((o) =>
          (o.id || o._id) === orderId
            ? {
                ...o,
                ...updated,
                status: updated?.status || status,
                statusLabel: updated?.statusLabel || o.statusLabel,
              }
            : o,
        ),
      );

      setSelectedOrder((prev) =>
        prev && (prev.id || prev._id) === orderId
          ? {
              ...prev,
              ...updated,
              status: updated?.status || status,
              statusLabel: updated?.statusLabel || prev.statusLabel,
            }
          : prev,
      );

      setStatusFeedback({ type: "success", text: "Cập nhật trạng thái đơn hàng thành công." });
    } catch (error) {
      setStatusFeedback({
        type: "error",
        text: error.message || "Không thể cập nhật trạng thái đơn hàng.",
      });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;

    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => (o.id || o._id) !== orderId));
      if (selectedOrder && (selectedOrder.id || selectedOrder._id) === orderId) {
        setSelectedOrder(null);
      }
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
                <th>ID</th>
                <th>Ngày</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
                <th>Chi tiết</th>
                <th>Xóa</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id || order._id}>
                  <td className="order-id">{order.id || order._id}</td>

                  <td>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("vi-VN")
                      : order.date}
                  </td>

                  <td>
                    <span className={getStatusClass(order.status)}>
                      {getStatusLabel(order)}
                    </span>
                  </td>

                  <td className="order-price">{formatPrice(Number(order.total || order.totalPrice || 0))}</td>

                  <td>
                    <button
                      className="btn-view"
                      onClick={() => handleViewOrder(order)}
                    >
                      Xem
                    </button>
                  </td>

                  <td>
                    <button className="btn-view" onClick={() => handleDeleteOrder(order.id || order._id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Chi tiết đơn hàng */}

        {selectedOrder && (
          <div className="admin-modal">
            <div className="admin-modal-content">
              <div className="modal-header">
                <h2>Chi tiết đơn hàng</h2>

                <button
                  className="modal-close"
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </button>
              </div>

              {statusFeedback.text && (
                <p className={`modal-feedback modal-feedback--${statusFeedback.type}`}>
                  {statusFeedback.text}
                </p>
              )}

              {/* INFO */}

              <div className="order-info">
                <div className="order-info__row">
                  <span>Mã đơn</span>
                  <b>{selectedOrder.id || selectedOrder._id || "-"}</b>
                </div>

                <div className="order-info__row">
                  <span>Ngày đặt</span>
                  <b>
                    {selectedOrder.createdAt
                      ? new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN")
                      : selectedOrder.date || "-"}
                  </b>
                </div>

                <div className="order-info__row order-info__row--status">
                  <span>Trạng thái</span>
                  <div className="order-status-wrap">
                    <span className={getStatusClass(selectedOrder.status)}>
                      {getStatusLabel(selectedOrder)}
                    </span>
                    <select
                      className="order-status-select"
                      value={selectedOrder.status || ""}
                      onChange={(e) =>
                        handleUpdateStatus(selectedOrder.id || selectedOrder._id, e.target.value)
                      }
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="processing">Đang xử lý</option>
                      <option value="shipping">Đang giao</option>
                      <option value="delivered">Đã giao</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* PRODUCT LIST */}

              <h3 className="order-product-title">Sản phẩm</h3>

              <div className="order-items">
                {(selectedOrder.items || selectedOrder.orderItems || []).map((item, index) => (
                  <div className="order-item" key={index}>
                    <img src={item.image || "https://picsum.photos/seed/order-item/80/80"} alt={item.name || item.product?.name || "Sản phẩm"} />

                    <div className="order-item-info">
                      <p className="item-name">{item.name || item.product?.name || String(item.product || "Sản phẩm")}</p>

                      <p className="item-qty">Số lượng: {item.qty || item.quantity}</p>
                    </div>

                    <div className="item-price">{formatPrice(item.price)}</div>
                  </div>
                ))}
              </div>

              {/* TOTAL */}

              <div className="order-total-box">
                <span>Tổng tiền</span>

                <b>{formatPrice(Number(selectedOrder.total || selectedOrder.totalPrice || 0))}</b>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
