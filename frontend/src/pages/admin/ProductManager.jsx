import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { ShoppingBag, Trash2, Plus, Edit, Search, ImageOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5001/api/admin/products", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(data.data || []);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (await Swal.fire({
        title: 'Xóa sản phẩm?', text: "Không thể hoàn tác!", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Xóa ngay'
    }).then(res => res.isConfirmed)) {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5001/api/admin/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Swal.fire("Đã xóa", "", "success");
            fetchProducts();
        } catch (error) {
            console.error(error); 
            Swal.fire("Lỗi", "Không thể xóa", "error"); }
    }
  };

  // ✅ LOGIC LẤY ẢNH (Ưu tiên mảng images từ Seed)
   const getProductImage = (product) => {
      let imgPath = null;

      // CẤP ĐỘ 1: Kiểm tra mảng images (Seed data mới)
      if (product.images && product.images.length > 0) {
          imgPath = product.images[0];
      }
      
      // CẤP ĐỘ 2: Kiểm tra trường image đơn (Dữ liệu cũ)
      else if (product.image) {
          imgPath = product.image;
      }

      // CẤP ĐỘ 3: Kiểm tra trong Variants (Cái mà Trang chủ đang lấy!)
      else if (product.variants && product.variants.length > 0) {
          // Lấy biến thể đầu tiên
          const firstVariant = product.variants[0];
          // Nếu biến thể có ảnh
          if (firstVariant.images && firstVariant.images.length > 0) {
              imgPath = firstVariant.images[0];
          }
      }

      // --- XỬ LÝ ĐƯỜNG DẪN CUỐI CÙNG ---
      
      // Nếu vẫn không tìm thấy ảnh nào -> Trả về ảnh Placeholder
      if (!imgPath) return "https://placehold.co/100x100?text=No+Image";

      // Nếu là ảnh Online (Cloudinary) -> Giữ nguyên
      if (imgPath.startsWith("http")) return imgPath;

      // Nếu là ảnh Local -> Thêm domain backend
      return `http://localhost:5001${imgPath}`;
  };
  // ✅ LOGIC TÍNH TỔNG KHO (Cộng dồn từ Variants)
  const getProductStock = (product) => {
      let total = 0;
      
      // Cách 1: Cộng từ variants (Dữ liệu Seed Data)
      if (product.variants && product.variants.length > 0) {
          product.variants.forEach(v => {
              if (v.sizes && Array.isArray(v.sizes)) {
                  v.sizes.forEach(s => {
                      total += (Number(s.stock) || 0);
                  });
              }
          });
      }
      
      // Cách 2: Nếu variants không có hoặc tổng = 0, dùng trường countInStock (Dữ liệu tạo tay)
      if (total === 0 && product.countInStock) {
          total = Number(product.countInStock) || 0;
      }
      
      return total;
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                <ShoppingBag className="text-blue-600"/> Quản lý sản phẩm <span className="text-gray-400 text-lg">({products.length})</span>
            </h2>
            <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <Search size={18} className="absolute left-3 top-3 text-gray-400"/>
                    <input type="text" placeholder="Tìm kiếm..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <button onClick={() => navigate("/admin/products/add")} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-lg transition">
                    <Plus size={20}/> <span className="hidden sm:inline">Thêm mới</span>
                </button>
            </div>
        </div>
        
        <div className="overflow-auto flex-1 rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse bg-white">
                <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="text-gray-600 uppercase text-xs font-bold tracking-wider bg-gray-50">
                        <th className="p-4 border-b w-24">Hình ảnh</th>
                        <th className="p-4 border-b">Tên sản phẩm</th>
                        <th className="p-4 border-b">Giá bán</th>
                        <th className="p-4 border-b">Kho hàng</th>
                        <th className="p-4 border-b">Danh mục</th>
                        <th className="p-4 border-b text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                    {filteredProducts.map(pro => (
                        <tr key={pro._id} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="p-4">
                                <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-white p-1">
                                    <img 
                                        src={getProductImage(pro)} 
                                        alt={pro.name} 
                                        className="w-full h-full object-contain"
                                        onError={(e) => {e.target.src = "https://placehold.co/100x100?text=No+Image"}}
                                    />
                                </div>
                            </td>
                            <td className="p-4 font-medium text-gray-800 max-w-[300px]">
                                <p className="truncate" title={pro.name}>{pro.name}</p>
                            </td>
                            <td className="p-4 font-bold text-blue-600 text-base">{pro.price.toLocaleString()}đ</td>
                            
                            {/* ✅ HIỂN THỊ KHO HÀNG  */}
                            <td className="p-4">
                                {(() => {
                                    const stock = getProductStock(pro); // Gọi hàm tính toán
                                    return stock > 0 
                                        ? <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Còn {stock}</span>
                                        : <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Hết hàng</span>
                                })()}
                            </td>

                            <td className="p-4 text-gray-600">
                                {pro.categoryId?.name || "---"}
                            </td>

                            <td className="p-4">
                                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => navigate(`/admin/products/edit/${pro._id}`)} className="bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition shadow-sm">
                                        <Edit size={18}/>
                                    </button>
                                    <button onClick={() => handleDelete(pro._id)} className="bg-white border border-gray-200 text-red-500 hover:bg-red-50 p-2 rounded-lg transition shadow-sm">
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};
export default ProductManager;