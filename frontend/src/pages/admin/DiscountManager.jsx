import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { Trash2, Edit } from "lucide-react";

const DiscountManager = () => {
  const { token } = useAuth();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    discountType: "holiday",
    discountValue: 0,
    startDate: "",
    endDate: "",
    priority: 1,
    isActive: true,
    description: "",
  });

  // ===== Fetch discounts =====
  const fetchDiscounts = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5001/api/admin/discounts",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDiscounts(data.success ? data.data : []);
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi", "Không tải được mã giảm giá", "error");
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  // ===== Handle form =====
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ===== Submit create/update =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5001/api/admin/discounts/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire("Thành công", "Cập nhật mã giảm giá thành công", "success");
      } else {
        await axios.post("http://localhost:5001/api/admin/discounts", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Thành công", "Tạo mã giảm giá mới thành công", "success");
      }
      setForm({
        name: "",
        code: "",
        discountType: "holiday",
        discountValue: 0,
        startDate: "",
        endDate: "",
        priority: 1,
        isActive: true,
        description: "",
      });
      setEditingId(null);
      fetchDiscounts();
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi", err.response?.data?.message || "Lỗi server", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (d) => {
    setForm({
      name: d.name,
      code: d.code,
      discountType: d.discountType,
      discountValue: d.discountValue,
      startDate: d.startDate ? d.startDate.slice(0, 10) : "",
      endDate: d.endDate ? d.endDate.slice(0, 10) : "",
      priority: d.priority,
      isActive: d.isActive,
      description: d.description,
    });
    setEditingId(d._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc muốn xóa mã giảm giá này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:5001/api/admin/discounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Đã xóa", "Mã giảm giá đã bị xóa", "success");
      fetchDiscounts();
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi", "Xóa thất bại", "error");
    }
  };

  if (loading)
    return (
      <p className="text-center py-20 text-gray-500 text-lg font-medium">
        Đang tải dữ liệu...
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
        Quản lý Mã Giảm Giá
      </h1>

      {/* ===== Form tạo / sửa ===== */}
      <div className="bg-gray-50 p-6 rounded-xl shadow-md border max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">
          {editingId ? "Cập nhật mã giảm giá" : "Tạo mới mã giảm giá"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Name, Code, Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">
                Tên mã
              </label>
              <input
                type="text"
                name="name"
                placeholder="Nhập tên mã"
                value={form.name}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1">
                Mã code
              </label>
              <input
                type="text"
                name="code"
                placeholder="Nhập mã code"
                value={form.code}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-400"
                required={form.discountType !== "percent"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Loại giảm giá
              </label>
              <select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="holiday">Holiday (VNĐ)</option>
                <option value="percent">Percent (%)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Value, Priority, Active */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-red-700 mb-1">
                Giá trị giảm
              </label>
              <input
                type="number"
                name="discountValue"
                placeholder={
                  form.discountType === "percent" ? "Giảm (%)" : "Giảm (VNĐ)"
                }
                value={form.discountValue}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-400"
                min={0}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-700 mb-1">
                Ưu tiên
              </label>
              <input
                type="number"
                name="priority"
                placeholder="Ưu tiên"
                value={form.priority}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
                min={0}
              />
            </div>
            <div className="flex items-center mt-6 md:mt-0">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="w-5 h-5 accent-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Kích hoạt
              </label>
            </div>
          </div>

          {/* Row 3: Start / End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">
                Ngày kết thúc
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              placeholder="Nhập mô tả"
              value={form.description}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full h-24 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
            >
              {editingId ? "Cập nhật" : "Tạo mã mới"}
            </button>
          </div>
        </form>
      </div>

      {/* ===== Danh sách mã giảm giá ===== */}
      <div className="bg-gray-50 p-6 rounded-xl shadow-md border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
          Danh sách mã giảm giá
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 text-sm border-b">
                <th className="py-2">Tên</th>
                <th>Code</th>
                <th>Giá trị</th>
                <th>Loại</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {discounts.length > 0 ? (
                discounts.map((d) => (
                  <tr
                    key={d._id}
                    className="border-b last:border-0 hover:bg-gray-100"
                  >
                    <td className="py-2 font-medium">{d.name}</td>
                    <td>{d.code}</td>
                    <td>
                      {d.discountType === "percent"
                        ? d.discountValue + "%"
                        : d.discountValue.toLocaleString() + "đ"}
                    </td>
                    <td>{d.discountType}</td>
                    <td>
                      {d.startDate
                        ? new Date(d.startDate).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                    <td>
                      {d.endDate
                        ? new Date(d.endDate).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                    <td>
                      {d.isActive ? (
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-medium">
                          Không hoạt động
                        </span>
                      )}
                    </td>
                    <td className="flex gap-2">
                      <button
                        onClick={() => handleEdit(d)}
                        className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(d._id)}
                        className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-4 text-gray-500 font-medium"
                  >
                    Chưa có mã giảm giá nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DiscountManager;
