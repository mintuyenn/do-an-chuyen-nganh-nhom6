import React from "react";
import { ShieldCheck, Clock, AlertCircle } from "lucide-react";

export default function WarrantyPolicyPage() {
  return (
    <div className="min-h-screen bg-white pt-[120px] pb-20 px-4 md:px-8 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-gray-100 pb-8 mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-4">
            Chính sách bảo hành
          </h1>
          <p className="text-gray-500">
            Cam kết chất lượng và dịch vụ hậu mãi trọn đời từ HPTSHOP.
          </p>
        </div>

        {/* Content Blocks */}
        <div className="space-y-12">
          {/* Section 1 */}
          <section className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-4">
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <Clock className="w-6 h-6" />
                <h2 className="text-xl font-bold uppercase tracking-wide">
                  Thời gian & Địa điểm
                </h2>
              </div>
            </div>
            <div className="md:col-span-8 text-gray-600 space-y-4 leading-relaxed">
              <p>
                <strong className="text-gray-900">Thời gian xử lý:</strong> Tối
                đa 14 ngày làm việc. Chúng tôi sẽ ưu tiên xử lý sớm nhất có thể
                và thông báo qua SMS/Email.
              </p>
              <div>
                <strong className="text-gray-900">Địa điểm tiếp nhận:</strong>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Tất cả chi nhánh HPT SHOP trên toàn quốc.</li>
                  <li>
                    Gửi chuyển phát về:{" "}
                    <strong>112 Hồ Văn Huê, Phú Nhuận, TP.HCM</strong> (Hotline:
                    0862347170).
                  </li>
                </ul>
              </div>
              <p>
                <strong className="text-gray-900">Khung giờ:</strong> 8:30 -
                21:00 (Tất cả các ngày trong tuần).
              </p>
            </div>
          </section>

          <div className="border-t border-gray-100"></div>

          {/* Section 2 */}
          <section className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-4">
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <ShieldCheck className="w-6 h-6" />
                <h2 className="text-xl font-bold uppercase tracking-wide">
                  Phạm vi bảo hành
                </h2>
              </div>
            </div>
            <div className="md:col-span-8 text-gray-600 space-y-4 leading-relaxed">
              <p>
                Áp dụng cho toàn bộ sản phẩm chính hãng mà không cần giữ hóa đơn
                giấy (tra cứu qua SĐT).
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-gray-900">Sửa chữa miễn phí:</strong>{" "}
                  Cắt gấu, lên lai, bóp eo, nới rộng (nếu còn vải dư).
                </li>
                <li>
                  <strong className="text-gray-900">Lỗi kỹ thuật:</strong> Bung
                  chỉ, hư dây kéo, đứt cúc, bung keo đế giày.
                </li>
                <li>
                  <strong className="text-gray-900">Thay thế phụ kiện:</strong>{" "}
                  Thay khóa kéo, đóng nút mới (sử dụng phụ kiện nguyên bản hoặc
                  tương đương).
                </li>
              </ul>
            </div>
          </section>

          <div className="border-t border-gray-100"></div>

          {/* Section 3 */}
          <section className="grid md:grid-cols-12 gap-6 bg-gray-50 p-6 rounded-xl">
            <div className="md:col-span-4">
              <div className="flex items-center gap-3 text-gray-900 mb-2">
                <AlertCircle className="w-6 h-6" />
                <h2 className="text-xl font-bold uppercase tracking-wide">
                  Lưu ý quan trọng
                </h2>
              </div>
            </div>
            <div className="md:col-span-8 text-gray-600 space-y-3 text-sm">
              <p>
                • Sản phẩm <strong>không áp dụng</strong> bảo hành: Đồ lót, tất
                (vớ), nước hoa, phụ kiện trang sức.
              </p>
              <p>
                • Trong vòng <strong>30 ngày đầu</strong>, nếu sản phẩm có lỗi
                từ nhà sản xuất, quý khách được đổi mới 1-1 ngay lập tức.
              </p>
              <p>
                • Chúng tôi có quyền từ chối bảo hành đối với các sản phẩm hư
                hỏng nặng do tác động vật lý, hóa chất hoặc hao mòn tự nhiên quá
                mức.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
