import AdminSidebar from "../components/AdminSidebar";
import { FiBox, FiShoppingCart, FiUsers, FiDollarSign } from "react-icons/fi";

import { products, mockOrders, mockUser } from "../data/data";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  // ===== TÍNH DOANH THU =====

  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);

  const formatPrice = (price) => price.toLocaleString("vi-VN") + "₫";

  // ===== STATS =====

  const stats = [
    {
      title: "Sản phẩm",
      value: products.length,
      icon: <FiBox />,
    },
    {
      title: "Đơn hàng",
      value: mockOrders.length,
      icon: <FiShoppingCart />,
    },
    {
      title: "Khách hàng",
      value: 1,
      icon: <FiUsers />,
    },
    {
      title: "Doanh thu",
      value: formatPrice(totalRevenue),
      icon: <FiDollarSign />,
    },
  ];

  // ===== DATA CHART =====

  const revenueData = mockOrders.map((o) => ({
    month: o.date.slice(3, 5),
    revenue: o.total,
  }));

  return (
    <div className="admin">
      <AdminSidebar />

      <div className="admin__content">
        <h1 className="admin__title">Dashboard</h1>

        {/* ===== STATS ===== */}

        <div className="admin__cards">
          {stats.map((s, i) => (
            <div key={i} className="admin__card">
              <div className="admin__card-icon">{s.icon}</div>

              <div className="admin__card-info">
                <p>{s.title}</p>
                <h3>{s.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* ===== CHART ===== */}

        <h2 style={{ marginTop: "40px" }}>Doanh thu đơn hàng</h2>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            marginTop: "15px",
          }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip formatter={(v) => formatPrice(v)} />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
