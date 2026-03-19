import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

const initialUsers = [
  {
    id: 1,
    name: "Nguyen Van A",
    email: "a@gmail.com",
    avatar: "https://i.pravatar.cc/100?img=1",
  },
  {
    id: 2,
    name: "Tran Van B",
    email: "b@gmail.com",
    avatar: "https://i.pravatar.cc/100?img=2",
  },
  {
    id: 3,
    name: "Le Thi C",
    email: "c@gmail.com",
    avatar: "https://i.pravatar.cc/100?img=3",
  },
];

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

  const extraUsers = [currentUser, localAuthUser]
    .filter(Boolean)
    .map((user, index) => ({
      id: user.id || Date.now() + index,
      name: user.name || user.fullName || "Người dùng",
      email: user.email || "",
      avatar: user.avatarUrl || user.avatar?.url || `https://i.pravatar.cc/100?u=${encodeURIComponent(user.email || String(user.id || index))}`,
    }))
    .filter((user) => user.email);

  const merged = [...initialUsers];

  extraUsers.forEach((extra) => {
    const exists = merged.some(
      (u) =>
        (u.email && u.email.toLowerCase() === extra.email.toLowerCase()) ||
        String(u.id) === String(extra.id),
    );

    if (!exists) {
      merged.unshift(extra);
    }
  });

  return merged;
};

export default function AdminUsers() {
  const [users, setUsers] = useState(() => buildUsersForAdmin());
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()),
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

        <div className="admin__toolbar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm người dùng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}

        <table className="admin__table">
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
                <td>{user.id}</td>

                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <img
                      src={user.avatar}
                      alt=""
                      width="40"
                      height="40"
                      style={{ borderRadius: "50%" }}
                    />

                    {user.name}
                  </div>
                </td>

                <td>{user.email}</td>

                <td>
                  <button
                    className="admin__delete"
                    onClick={() => deleteUser(user.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
