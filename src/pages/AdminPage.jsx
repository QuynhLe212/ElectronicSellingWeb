import { useState } from "react";

import AdminSidebar from "../components/AdminSidebar";
import AdminDashboard from "./AdminDashboard";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import AdminUsers from "./AdminUsers";

import "./AdminPage.css";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="admin">
      <div className="container">
        <div className="admin__layout">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <main className="admin__main">
            {activeTab === "dashboard" && <AdminDashboard />}

            {activeTab === "products" && <AdminProducts />}

            {activeTab === "orders" && <AdminOrders />}

            {activeTab === "users" && <AdminUsers />}
          </main>
        </div>
      </div>
    </div>
  );
}
