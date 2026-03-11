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

export default function AdminUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
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
