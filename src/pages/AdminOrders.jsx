import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { mockOrders } from "../data/data";

export default function AdminOrders() {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const formatPrice = (price) => price.toLocaleString("vi-VN") + "₫";

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

  return (
    <div className="admin">
      <AdminSidebar />

      <div className="admin__content">
        <h1 className="admin__title">Quản lý đơn hàng</h1>

        <div className="admin__card">
          <table className="admin__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ngày</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
                <th>Chi tiết</th>
              </tr>
            </thead>

            <tbody>
              {mockOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">{order.id}</td>

                  <td>{order.date}</td>

                  <td>
                    <span className={getStatusClass(order.status)}>
                      {order.statusLabel}
                    </span>
                  </td>

                  <td className="order-price">{formatPrice(order.total)}</td>

                  <td>
                    <button
                      className="btn-view"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Xem
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

              {/* INFO */}

              <div className="order-info">
                <div>
                  <span>Mã đơn</span>
                  <b>{selectedOrder.id}</b>
                </div>

                <div>
                  <span>Ngày đặt</span>
                  <b>{selectedOrder.date}</b>
                </div>

                <div>
                  <span>Trạng thái</span>
                  <span className={getStatusClass(selectedOrder.status)}>
                    {selectedOrder.statusLabel}
                  </span>
                </div>
              </div>

              {/* PRODUCT LIST */}

              <h3 className="order-product-title">Sản phẩm</h3>

              <div className="order-items">
                {selectedOrder.items.map((item, index) => (
                  <div className="order-item" key={index}>
                    <img src={item.image} alt="" />

                    <div className="order-item-info">
                      <p className="item-name">{item.product}</p>

                      <p className="item-qty">Số lượng: {item.qty}</p>
                    </div>

                    <div className="item-price">{formatPrice(item.price)}</div>
                  </div>
                ))}
              </div>

              {/* TOTAL */}

              <div className="order-total-box">
                <span>Tổng tiền</span>

                <b>{formatPrice(selectedOrder.total)}</b>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
