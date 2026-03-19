import AdminSidebar from "../components/AdminSidebar";
import { FiBox, FiShoppingCart, FiUsers, FiDollarSign } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../services/productsService";
import { getOrdersAdmin } from "../services/ordersService";

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
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const formatPrice = (price) => price.toLocaleString("vi-VN") + "₫";

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [productResponse, orderResponse] = await Promise.all([
          getProducts({ page: 1, limit: 500 }),
          getOrdersAdmin(),
        ]);

        if (ignore) return;
        setProducts(productResponse.products || []);
        setOrders(orderResponse || []);
      } catch (error) {
        if (ignore) return;
        setErrorMessage(error.message || "Không thể tải dữ liệu dashboard.");
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total || order.totalPrice || 0), 0),
    [orders],
  );

  // ===== STATS =====

  const stats = [
    {
      title: "Sản phẩm",
      value: products.length,
      icon: <FiBox />,
    },
    {
      title: "Đơn hàng",
      value: orders.length,
      icon: <FiShoppingCart />,
    },
    {
      title: "Khách hàng",
      value: "-",
      icon: <FiUsers />,
    },
    {
      title: "Doanh thu",
      value: formatPrice(totalRevenue),
      icon: <FiDollarSign />,
    },
  ];

  // ===== DATA CHART =====

  const revenueData = useMemo(
    () =>
      orders.map((o) => ({
        month: o.createdAt
          ? new Date(o.createdAt).toLocaleDateString("vi-VN", { month: "2-digit" })
          : (o.date?.slice(3, 5) || "--"),
        revenue: Number(o.total || o.totalPrice || 0),
      })),
    [orders],
  );

  return (
    <div className="admin">
      <AdminSidebar />

      <div className="admin__content">
        <h1 className="admin__title">Dashboard</h1>

        {isLoading && <p>Đang tải dữ liệu dashboard...</p>}
        {errorMessage && <p style={{ color: "var(--danger)" }}>{errorMessage}</p>}

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
