import AdminSidebar from "../components/AdminSidebar";
import { FiBox, FiShoppingCart, FiUsers, FiDollarSign } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../services/productsService";
import { getOrdersAdmin } from "../services/ordersService";

import {
  LineChart,
  Line,
  LabelList,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const statusLabelMap = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const normalizeStatus = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "shipped") return "shipping";
  if (["pending", "processing", "shipping", "delivered", "cancelled"].includes(normalized)) {
    return normalized;
  }
  return "pending";
};

const parseOrderDate = (order) => {
  if (order?.createdAt) {
    const date = new Date(order.createdAt);
    if (!Number.isNaN(date.getTime())) return date;
  }

  if (order?.date) {
    const [day, month, year] = String(order.date).split("/").map(Number);
    if (day && month && year) {
      const parsed = new Date(year, month - 1, day);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }

  return null;
};

const getMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
const getMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split("-");
  return `${month}/${year.slice(-2)}`;
};

const toSafeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const calculateOrderTotal = (order) => {
  const directTotal = toSafeNumber(
    order?.total ?? order?.totalPrice ?? order?.itemsPrice ?? order?.amount ?? order?.finalAmount,
  );
  if (directTotal > 0) {
    return directTotal;
  }

  const items = Array.isArray(order?.orderItems)
    ? order.orderItems
    : Array.isArray(order?.items)
      ? order.items
      : [];

  const itemsSubtotal = items.reduce((sum, item) => {
    const quantity = toSafeNumber(item?.quantity ?? item?.qty ?? 1);
    const price = toSafeNumber(item?.price ?? item?.unitPrice ?? item?.product?.price);
    return sum + quantity * price;
  }, 0);

  if (itemsSubtotal > 0) {
    return itemsSubtotal + toSafeNumber(order?.shippingPrice) + toSafeNumber(order?.taxPrice);
  }

  return 0;
};

const formatCompactVnd = (value) => {
  const amount = toSafeNumber(value);
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return `${Math.round(amount)}`;
};

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
    () => orders.reduce((sum, order) => sum + calculateOrderTotal(order), 0),
    [orders],
  );

  const normalizedOrders = useMemo(
    () => orders.map((order) => ({
      ...order,
      status: normalizeStatus(order?.status),
      totalValue: calculateOrderTotal(order),
      createdDate: parseOrderDate(order),
    })),
    [orders],
  );

  const uniqueCustomers = useMemo(() => {
    const customerIds = new Set();
    normalizedOrders.forEach((order) => {
      const fromUserObj = order?.user?._id || order?.user?.id || order?.user?.email;
      const fromEmail = order?.userEmail;
      const identity = String(fromUserObj || fromEmail || "").trim().toLowerCase();
      if (identity) {
        customerIds.add(identity);
      }
    });
    return customerIds.size;
  }, [normalizedOrders]);

  const averageOrderValue = useMemo(
    () => (normalizedOrders.length ? totalRevenue / normalizedOrders.length : 0),
    [normalizedOrders.length, totalRevenue],
  );

  const deliveredCount = useMemo(
    () => normalizedOrders.filter((order) => order.status === "delivered").length,
    [normalizedOrders],
  );

  const statusSummary = useMemo(() => {
    const summary = { pending: 0, processing: 0, shipping: 0, delivered: 0, cancelled: 0 };
    normalizedOrders.forEach((order) => {
      if (summary[order.status] !== undefined) {
        summary[order.status] += 1;
      }
    });
    return summary;
  }, [normalizedOrders]);

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
      value: uniqueCustomers,
      icon: <FiUsers />,
    },
    {
      title: "Doanh thu",
      value: formatPrice(totalRevenue),
      icon: <FiDollarSign />,
    },
  ];

  // ===== DATA CHART =====

  const revenueData = useMemo(() => {
    const now = new Date();
    const monthKeys = [];
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthKeys.push(getMonthKey(date));
    }

    const grouped = monthKeys.reduce((acc, key) => {
      acc[key] = { revenue: 0, orders: 0 };
      return acc;
    }, {});

    normalizedOrders.forEach((order) => {
      if (!order.createdDate) return;
      const key = getMonthKey(order.createdDate);
      if (!grouped[key]) return;

      grouped[key].revenue += order.totalValue;
      grouped[key].orders += 1;
    });

    return monthKeys.map((key) => ({
      month: getMonthLabel(key),
      revenue: grouped[key].revenue,
      orders: grouped[key].orders,
    }));
  }, [normalizedOrders]);

  return (
    <div className="admin">
      <AdminSidebar />

      <div className="admin__content">
        <h1 className="admin__title">Dashboard</h1>

        {isLoading && <p>Đang tải dữ liệu dashboard...</p>}
        {errorMessage && <p style={{ color: "var(--danger)" }}>{errorMessage}</p>}

        {/* ===== STATS ===== */}

        <div className="admin__stats">
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

        <div className="admin__stats" style={{ marginTop: "12px", marginBottom: "8px" }}>
          <div className="admin__card">
            <div className="admin__card-info">
              <p>Đơn đã giao</p>
              <h3>{deliveredCount}</h3>
            </div>
          </div>
          <div className="admin__card">
            <div className="admin__card-info">
              <p>Giá trị đơn TB</p>
              <h3>{formatPrice(Math.round(averageOrderValue))}</h3>
            </div>
          </div>
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

              <YAxis tickFormatter={formatCompactVnd} width={72} />

              <Tooltip
                formatter={(value, name) => {
                  if (name === "revenue") return [formatPrice(Number(value || 0)), "Doanh thu"];
                  return [value, "Số đơn"];
                }}
              />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="transparent"
                legendType="none"
                isAnimationActive={false}
                dot={false}
              >
                <LabelList
                  dataKey="revenue"
                  position="top"
                  formatter={(value) => formatCompactVnd(value)}
                  style={{ fill: "#111827", fontWeight: 700, fontSize: 12 }}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="admin__card" style={{ marginTop: "18px", alignItems: "flex-start" }}>
          <div className="admin__card-info" style={{ width: "100%" }}>
            <p>Phân bổ trạng thái đơn hàng</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
              {Object.entries(statusSummary).map(([status, count]) => (
                <span
                  key={status}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "999px",
                    background: "#f3f4f6",
                    color: "#374151",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {statusLabelMap[status]}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
