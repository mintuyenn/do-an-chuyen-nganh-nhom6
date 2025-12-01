import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { ArrowLeft, Loader, UploadCloud, Trash2, Save, Image as ImageIcon, XCircle, PlusSquare, Link as LinkIcon, Plus } from "lucide-react";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "", price: "", description: "", category: "", image: "",
  });
  
  const [gallery, setGallery] = useState([]); 
  const [linkInput, setLinkInput] = useState("");
  const [variantRows, setVariantRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); 
  const [uploadingGallery, setUploadingGallery] = useState(false); 

  const getPreview = (path) => {
    if(!path) return null;
    return path.startsWith("http") ? path : `http://localhost:5001${path}`;
  }

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const { data } = await axios.get(`http://localhost:5001/api/products/${id}`);
          
          let catName = "";
          if (data.categoryId && data.categoryId.name) catName = data.categoryId.name;
          else if (data.category) catName = data.category;

          let mainImgUrl = data.image || "";
          if (!mainImgUrl && data.images && data.images.length > 0) mainImgUrl = data.images[0];
          if (!mainImgUrl && data.variants && data.variants.length > 0 && data.variants[0].images?.length > 0) {
              mainImgUrl = data.variants[0].images[0];
          }

          let allImages = [];
          if (data.images) allImages = [...data.images];
          if (data.variants) {
              data.variants.forEach(v => {
                  if (v.images) allImages = [...allImages, ...v.images];
              });
          }
          const uniqueGallery = [...new Set(allImages)].filter(img => img !== mainImgUrl && img);
          setGallery(uniqueGallery);

          setFormData({
            name: data.name || "",
            price: data.price || 0,
            description: data.description || "",
            category: catName,
            image: mainImgUrl,
          });

          const flatVariants = [];
          if (data.variants && data.variants.length > 0) {
              data.variants.forEach((v, vIndex) => {
                  // Lấy ảnh riêng của variant này
                  let varImg = "";
                  if (v.images && v.images.length > 0) varImg = v.images[0];

                  if (v.sizes && v.sizes.length > 0) {
                      v.sizes.forEach((s, sIndex) => {
                          flatVariants.push({
                              id: `existing-${vIndex}-${sIndex}`,
                              color: v.color, size: s.size, stock: s.stock,
                              image: varImg // Load ảnh riêng
                          });
                      });
                  } else {
                      flatVariants.push({ 
                          id: `existing-${vIndex}`, color: v.color, size: "Free", stock: data.countInStock || 0,
                          image: varImg
                      });
                  }
              });
          } else {
              flatVariants.push({ id: Date.now(), color: 'Mặc định', size: 'Free', stock: data.countInStock || 0, image: "" });
          }
          setVariantRows(flatVariants);

        } catch (error) {
          console.error(error);
          Swal.fire("Lỗi", "Không tải được dữ liệu", "error");
        }
      };
      fetchProduct();
    } else {
        setVariantRows([{ id: Date.now(), color: '', size: '', stock: 0, image: "" }]);
    }
  }, [id, isEditMode]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleVariantChange = (id, field, value) => {
      const newRows = variantRows.map(row => row.id === id ? { ...row, [field]: value } : row);
      setVariantRows(newRows);
  };
  const addVariantRow = () => setVariantRows([...variantRows, { id: Date.now(), color: '', size: '', stock: 0, image: "" }]);
  const removeVariantRow = (id) => {
      if(variantRows.length > 1) setVariantRows(variantRows.filter(row => row.id !== id));
  };

  const handleRemoveFromGallery = (imgToRemove) => {
      setGallery(gallery.filter(img => img !== imgToRemove));
  }
  const handleRemoveMainImage = () => setFormData({ ...formData, image: "" });

  // Thêm link vào gallery chung
  const handleAddLinkToGallery = () => {
      if (!linkInput.trim()) return;
      setGallery([...gallery, linkInput.trim()]);
      if (!formData.image) setFormData(prev => ({ ...prev, image: linkInput.trim() }));
      setLinkInput(""); 
      const Toast = Swal.mixin({ toast: true, position: "top-end", showConfirmButton: false, timer: 3000, timerProgressBar: true });
      Toast.fire({ icon: "success", title: "Đã thêm ảnh vào kho chung" });
  }

  const totalStockDisplay = variantRows.reduce((acc, row) => acc + (Number(row.stock) || 0), 0);

  const uploadMainImageHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    setUploading(true);
    try {
        const { data } = await axios.post("http://localhost:5001/api/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        setFormData(prev => ({ ...prev, image: data }));
        setUploading(false);
    } catch (error) { 
      console.error(error);
      setUploading(false); Swal.fire("Lỗi upload", "", "error"); }
  };

  const uploadGalleryHandler = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      setUploadingGallery(true);
      try {
          const uploadPromises = files.map(async (file) => {
              const fd = new FormData();
              fd.append("image", file);
              const { data } = await axios.post("http://localhost:5001/api/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
              return data;
          });
          const uploadedUrls = await Promise.all(uploadPromises);
          setGallery(prev => [...prev, ...uploadedUrls]);
          setUploadingGallery(false);
          Swal.fire({ icon: 'success', title: `Đã thêm ${uploadedUrls.length} ảnh!`, timer: 1500, showConfirmButton: false });
      } catch (error) {
          console.error(error);
          setUploadingGallery(false);
          Swal.fire("Lỗi", "Không thể upload ảnh", "error");
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const groupedVariants = {};
      variantRows.forEach(row => {
          const colorKey = row.color || "Mặc định";
          if (!groupedVariants[colorKey]) {
              // ⚡ Ưu tiên lấy ảnh từ dòng này
              let varImages = [];
              if (row.image && row.image.trim() !== "") {
                  varImages = [row.image];
              }

              groupedVariants[colorKey] = {
                  color: colorKey,
                  sizes: [],
                  images: varImages
              };
          } else {
              // Nếu dòng trước chưa có ảnh, mà dòng này có, thì bổ sung vào
              if (groupedVariants[colorKey].images.length === 0 && row.image && row.image.trim() !== "") {
                  groupedVariants[colorKey].images = [row.image];
              }
          }

          groupedVariants[colorKey].sizes.push({
              size: row.size || "Free",
              stock: Number(row.stock)
          });
      });

      // Fallback: Nếu variant vẫn chưa có ảnh, lấy ảnh chính
      Object.values(groupedVariants).forEach(group => {
          if (group.images.length === 0 && formData.image) {
              group.images = [formData.image];
          }
      });

      const allVariantImages = Object.values(groupedVariants).flatMap(g => g.images);
      const finalAllImages = [...new Set([formData.image, ...gallery, ...allVariantImages])].filter(Boolean);

      const payload = {
          ...formData,
          price: Number(formData.price),
          countInStock: totalStockDisplay,
          variants: Object.values(groupedVariants),
          image: formData.image,
          images: finalAllImages 
      };

      if (isEditMode) await axios.put(`http://localhost:5001/api/admin/products/${id}`, payload, config);
      else await axios.post("http://localhost:5001/api/admin/products", payload, config);

      Swal.fire("Thành công", "Đã lưu sản phẩm!", "success");
      navigate("/admin/products");
    } catch (error) {
      Swal.fire("Lỗi", error.response?.data?.message || "Lỗi server", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-10">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin/products")} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft/></button>
        <h2 className="text-2xl font-bold">{isEditMode ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: ẢNH CHUNG */}
        <div className="lg:col-span-1 space-y-6 border-r pr-6">
            <div>
                <label className="block font-bold text-gray-700 mb-2">1. Ảnh Đại Diện (Chung)</label>
                <div className="border-2 border-dashed p-2 flex flex-col items-center justify-center min-h-[250px] bg-gray-50 relative group rounded-lg overflow-hidden border-blue-200">
                    {uploading ? <Loader className="animate-spin text-blue-500"/> : 
                    formData.image ? (
                        <>
                            <img src={getPreview(formData.image)} className="w-full h-full object-contain rounded" onError={(e) => e.target.src="https://placehold.co/300?text=Lỗi+Ảnh"}/>
                            <button type="button" onClick={handleRemoveMainImage} className="absolute top-2 right-2 bg-white text-red-600 p-2 rounded-full shadow-md z-20 hover:bg-red-50 transition border border-gray-200"><Trash2 size={20}/></button>
                        </>
                    ) : (
                        <div className="text-center text-gray-400"><ImageIcon size={48} className="mx-auto mb-2 opacity-50"/><p className="text-sm">Chưa có ảnh</p></div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <label className="bg-white px-4 py-2 rounded cursor-pointer flex gap-2 hover:scale-105 transition shadow-lg"><UploadCloud/> Thay ảnh
                        <input type="file" hidden onChange={uploadMainImageHandler}/></label>
                    </div>
                </div>
                <input name="image" placeholder="Link ảnh chính..." className="w-full mt-2 p-2 border rounded text-sm focus:border-blue-500 outline-none" value={formData.image} onChange={handleChange}/>
            </div>

            {/* Gallery */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block font-bold text-gray-700">2. Kho ảnh (Dùng chung)</label>
                    <label className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded cursor-pointer hover:bg-blue-100 flex items-center gap-1">
                        <PlusSquare size={14}/> Upload nhiều
                        <input type="file" multiple hidden onChange={uploadGalleryHandler}/>
                    </label>
                </div>
                {uploadingGallery && <div className="text-center py-2 text-sm text-blue-500 flex justify-center gap-2"><Loader className="animate-spin" size={16}/> Đang tải ảnh...</div>}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {gallery.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square bg-gray-50 rounded border overflow-hidden">
                            <img src={getPreview(img)} className="w-full h-full object-cover"/>
                            <button type="button" onClick={() => handleRemoveFromGallery(img)} className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition hover:bg-red-50">
                                <XCircle size={16}/>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <LinkIcon size={16} className="absolute left-3 top-3 text-gray-400"/>
                        <input type="text" placeholder="Dán link vào kho chung..." className="w-full pl-9 pr-2 py-2 border rounded text-sm outline-none focus:border-blue-500" value={linkInput} onChange={(e) => setLinkInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddLinkToGallery(); } }}/>
                    </div>
                    <button type="button" onClick={handleAddLinkToGallery} className="bg-gray-100 text-gray-600 px-3 py-2 rounded text-sm font-medium hover:bg-gray-200">Thêm</button>
                </div>
            </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN */}
        <div className="lg:col-span-2 space-y-5">
            <input name="name" placeholder="Tên sản phẩm" required className="w-full p-3 border rounded font-bold text-lg" value={formData.name} onChange={handleChange}/>
            <div className="grid grid-cols-2 gap-4">
                <input name="price" type="number" placeholder="Giá bán" required className="p-3 border rounded" value={formData.price} onChange={handleChange}/>
                <input name="category" placeholder="Danh mục" className="p-3 border rounded" value={formData.category} onChange={handleChange}/>
            </div>
            <textarea name="description" rows="3" placeholder="Mô tả sản phẩm" className="w-full p-3 border rounded" value={formData.description} onChange={handleChange}/>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-700">3. Phân loại & Ảnh theo Màu</h3>
                    <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">Tổng kho: {totalStockDisplay}</span>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {variantRows.map((row) => (
                        <div key={row.id} className="flex gap-2 items-center bg-white p-2 rounded border shadow-sm">
                            <input placeholder="Màu (Trắng)" className="flex-1 p-2 border rounded text-sm" value={row.color} onChange={e => handleVariantChange(row.id, 'color', e.target.value)}/>
                            <input placeholder="Size" className="w-16 p-2 border rounded text-sm" value={row.size} onChange={e => handleVariantChange(row.id, 'size', e.target.value)}/>
                            <input type="number" placeholder="SL" className="w-16 p-2 border rounded text-sm text-center font-bold" value={row.stock} onChange={e => handleVariantChange(row.id, 'stock', e.target.value)}/>
                            
                            {/* 🔥 Ô QUAN TRỌNG NHẤT: DÁN ẢNH MÀU VÀO ĐÂY */}
                            <div className="w-40 relative">
                                <input 
                                    placeholder="Link ảnh màu này..." 
                                    className="w-full p-2 pl-7 border rounded text-xs bg-yellow-50 focus:bg-white border-yellow-200 focus:border-blue-500"
                                    value={row.image || ""} 
                                    onChange={e => handleVariantChange(row.id, 'image', e.target.value)}
                                    title="Dán link ảnh riêng cho màu này (Ví dụ: Ảnh áo trắng)"
                                />
                                {row.image ? (
                                    <img src={getPreview(row.image)} className="absolute left-1 top-1 w-6 h-6 rounded object-cover border"/>
                                ) : (
                                    <ImageIcon size={14} className="absolute left-2 top-2.5 text-gray-400"/>
                                )}
                            </div>

                            <button type="button" onClick={() => removeVariantRow(row.id)} className="p-2 text-red-400 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addVariantRow} className="mt-3 flex items-center gap-1 text-sm font-bold text-blue-600"><Plus size={16}/> Thêm dòng</button>
            </div>

            <button disabled={loading} className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 flex items-center justify-center gap-2">
                <Save size={20}/> {loading ? "Đang lưu..." : "LƯU SẢN PHẨM"}
            </button>
        </div>
      </form>
    </div>
  );
};
export default ProductForm;