import { useEffect, useState } from "react";
import { getAllUsers } from "../services/userService";
import { useAuth } from "../context/AuthContext";

export default function AdminUsersPage() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (token && user?.role === "admin") {
          const res = await getAllUsers(token);
          setUsers(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch users");
      }
    };
    fetchUsers();
  }, [token, user]);

  if (!user || user.role !== "admin") return <p>🚫 Access denied</p>;

  return (
    <div>
      <h2>👤 All Users (Admin)</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {users.map((u) => (
          <li key={u._id}>
            {u.username} - {u.fullName} - {u.email} - {u.role}
          </li>
        ))}
      </ul>
    </div>
  );
}
