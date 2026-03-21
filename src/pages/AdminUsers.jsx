import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
const getUserFromStorage = (key) => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
};

const buildUsersForAdmin = () => {
  const currentUser = getUserFromStorage("user_data");
  const localAuthUser = getUserFromStorage("local_auth_user");

  return [currentUser, localAuthUser]
    .filter(Boolean)
    .map((user, index) => ({
      id: user.id || Date.now() + index,
      name: user.name || user.fullName || "Người dùng",
      email: user.email || "",
      avatar:
        user.avatarUrl ||
        user.avatar?.url ||
        `https://i.pravatar.cc/100?u=${encodeURIComponent(user.email || String(index))}`,
    }))
    .filter((user) => user.email);
};

export default function AdminUsers() {
  const [users, setUsers] = useState(() => buildUsersForAdmin());
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const deleteUser = (id) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="admin">
      <AdminSidebar />

      <div className="admin__content">
        <h1 className="admin__title">Quản lý người dùng</h1>

        {/* TOOLBAR */}
        <div className="admin__toolbar modern">
          <input
            className="search-modern"
            type="text"
            placeholder="🔍 Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="user-count">{filteredUsers.length} người dùng</div>
        </div>

        {/* EMPTY */}
        {filteredUsers.length === 0 && (
          <div className="empty-box">
            <p>Không có người dùng nào</p>
          </div>
        )}

        {/* TABLE */}
        {filteredUsers.length > 0 && (
          <div className="table-wrapper">
            <table className="admin__table modern">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="user-id">#{user.id}</td>

                    <td>
                      <div className="user-info">
                        <img src={user.avatar} alt="" />
                        <div>
                          <div className="user-name">{user.name}</div>
                          <div className="user-sub">User</div>
                        </div>
                      </div>
                    </td>

                    <td className="user-email">{user.email}</td>

                    <td>
                      <button className="btn-delete" onClick={() => deleteUser(user.id)}>
                        🗑 Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
