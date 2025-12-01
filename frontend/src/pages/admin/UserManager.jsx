import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Trash2, User } from "lucide-react";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5001/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(data.data);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc muốn xóa người dùng này?")) {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5001/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Swal.fire("Đã xóa", "", "success");
            fetchUsers();
        } catch (error) {
            console.error(error);
            Swal.fire("Lỗi", "Không thể xóa", "error");
        }
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><User/> Quản lý khách hàng ({users.length})</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
                        <th className="p-4">Tên</th>
                        <th>Email</th>
                        <th>Ngày tham gia</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium">{user.fullName || user.username}</td>
                            <td>{user.email}</td>
                            <td>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</td>
                            <td>
                                <button onClick={() => handleDelete(user._id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                                    <Trash2 size={18}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-gray-500">Chưa có khách hàng nào</td></tr>}
                </tbody>
            </table>
        </div>
    </div>
  );
};
export default UserManager;