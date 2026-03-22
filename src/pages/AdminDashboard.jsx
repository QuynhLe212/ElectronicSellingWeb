import AdminSidebar from "../components/AdminSidebar";
import { FiBox, FiShoppingCart, FiUsers, FiDollarSign } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../services/productsService";
import { getOrdersAdmin } from "../services/ordersService";
import { getUsersAdmin } from "../services/usersService";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [totals, setTotals] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const toAmount = (value) => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === "string") {
      const normalized = value.replace(/[^\d.-]/g, "");
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  };

  const formatPrice = (price) => price.toLocaleString("vi-VN") + "₫";

  const formatCompactPrice = (value) => {
    const amount = toAmount(value);
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
    return String(amount);
  };

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [productResponse, orderResponse, usersResponse] = await Promise.all([
          getProducts({ page: 1, limit: 500 }),
          getOrdersAdmin({ page: 1, limit: 100 }, { withMeta: true }),
          getUsersAdmin({ page: 1, limit: 500 }),
        ]);

        if (ignore) return;

        const firstPageOrders = Array.isArray(orderResponse?.orders)
          ? orderResponse.orders
          : [];
        const totalPages = Number(orderResponse?.pagination?.totalPages || 1);

        let allOrders = [...firstPageOrders];

        if (totalPages > 1) {
          const pageRequests = [];
          for (let page = 2; page <= totalPages; page += 1) {
            pageRequests.push(getOrdersAdmin({ page, limit: 100 }, { withMeta: true }));
          }

          const remainingResponses = await Promise.all(pageRequests);
          remainingResponses.forEach((response) => {
            if (Array.isArray(response?.orders)) {
              allOrders = allOrders.concat(response.orders);
            }
          });
        }

        setOrders(allOrders);

        const syncedRevenue = allOrders.reduce(
          (sum, order) => sum + toAmount(order?.total ?? order?.totalPrice ?? 0),
          0
        );

        setTotals({
          products: Number(productResponse?.total || productResponse?.products?.length || 0),
          orders: Number(orderResponse?.pagination?.totalOrders || allOrders.length || 0),
          users: Number(usersResponse?.pagination?.total || usersResponse?.users?.length || 0),
          revenue: syncedRevenue,
        });
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

  // ===== STATS =====

  const stats = [
    {
      title: "Sản phẩm",
      value: totals.products,
      icon: <FiBox />,
    },
    {
      title: "Đơn hàng",
      value: totals.orders,
      icon: <FiShoppingCart />,
    },
    {
      title: "Khách hàng",
      value: totals.users,
      icon: <FiUsers />,
    },
    {
      title: "Doanh thu",
      value: formatPrice(totals.revenue),
      icon: <FiDollarSign />,
    },
  ];

  // ===== DATA CHART =====

  const revenueData = useMemo(() => {
    const monthlyMap = {};

    orders.forEach((o) => {
      const date = o.createdAt ? new Date(o.createdAt) : new Date();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      monthlyMap[monthKey] =
        (monthlyMap[monthKey] || 0) + toAmount(o.total ?? o.totalPrice ?? 0);
    });

    const sorted = Object.entries(monthlyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, revenue]) => ({ month, revenue }));

    // Keep at least 6 months on chart so bars stay readable and not collapsed into a single point.
    if (sorted.length >= 6) {
      return sorted;
    }

    const now = new Date();
    const filledMap = new Map(sorted.map((item) => [item.month, item.revenue]));

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!filledMap.has(monthKey)) {
        filledMap.set(monthKey, 0);
      }
    }

    return Array.from(filledMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, revenue]) => ({ month, revenue }));
  }, [orders]);

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
            <BarChart data={revenueData} barGap={10} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis tickFormatter={(value) => formatCompactPrice(value)} width={72} />

              <Tooltip formatter={(v) => formatPrice(v)} />

              <Bar
                dataKey="revenue"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
                maxBarSize={52}
                minPointSize={4}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
