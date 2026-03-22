import { Link, useLocation } from "react-router-dom";
import { FiHome, FiBox, FiShoppingCart, FiUsers, FiLogOut } from "react-icons/fi";

export default function AdminSidebar() {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/admin", icon: <FiHome /> },
    { name: "Products", path: "/admin/products", icon: <FiBox /> },
    { name: "Orders", path: "/admin/orders", icon: <FiShoppingCart /> },
    { name: "Users", path: "/admin/users", icon: <FiUsers /> },
  ];

  return (
    <div className="admin__sidebar">
      <h2 className="admin__logo">ADMIN</h2>

      <nav className="admin__menu">
        {menu.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`admin__menu-item ${location.pathname === item.path ? "active" : ""}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="admin__sidebar-footer">
        <Link to="/" className="admin__exit-btn">
          <FiLogOut />
          <span>Thoát</span>
        </Link>
      </div>
    </div>
  );
}
