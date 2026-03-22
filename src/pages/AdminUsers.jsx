import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { getUsersAdmin } from "../services/usersService";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await getUsersAdmin({ page: 1, limit: 500 });
        if (ignore) return;
        setUsers(Array.isArray(response?.users) ? response.users : []);
      } catch (error) {
        if (ignore) return;
        setErrorMessage(error.message || "Không thể tải người dùng.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadUsers();

    return () => {
      ignore = true;
    };
  }, []);

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

        {isLoading && <p>Đang tải người dùng...</p>}
        {errorMessage && <p style={{ color: "var(--danger)" }}>{errorMessage}</p>}

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
