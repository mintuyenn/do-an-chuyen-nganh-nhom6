import React from "react";
import * as Motion from "framer-motion";
import {
  Crown,
  Gift,
  ShieldCheck,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";

const policies = [
  {
    icon: <Crown strokeWidth={1.5} />,
    title: "Thành viên Vàng",
    description:
      "Giảm trực tiếp 15% trọn đời. Đặc quyền thử đồ tại phòng VIP và ưu tiên thanh toán.",
  },
  {
    icon: <Gift strokeWidth={1.5} />,
    title: "Quà tặng Sinh nhật",
    description:
      "Nhận voucher mua sắm trị giá tới 1.000.000đ và bánh kem vào tháng sinh nhật của bạn.",
  },
  {
    icon: <ShieldCheck strokeWidth={1.5} />,
    title: "Bảo mật tuyệt đối",
    description:
      "Dữ liệu cá nhân và lịch sử mua hàng được mã hóa chuẩn SSL, cam kết không chia sẻ với bên thứ 3.",
  },
  {
    icon: <Ticket strokeWidth={1.5} />,
    title: "Voucher độc quyền",
    description:
      "Truy cập kho voucher giới hạn hàng tháng. Tham gia Flash Sale sớm hơn 30 phút.",
  },
  {
    icon: <TrendingUp strokeWidth={1.5} />,
    title: "Tích điểm hoàn tiền",
    description:
      "Tích lũy 5-10% giá trị mỗi đơn hàng vào ví điểm thưởng. Sử dụng điểm như tiền mặt.",
  },
  {
    icon: <Users strokeWidth={1.5} />,
    title: "Private Workshop",
    description:
      "Thư mời tham dự các buổi ra mắt bộ sưu tập mới và workshop styling cá nhân.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function MemberPolicyPage() {
  return (
    <div className="min-h-screen bg-white pt-[120px] pb-24 px-4 md:px-8 font-sans text-gray-900">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-4">
          CHÍNH SÁCH THÀNH VIÊN
        </h1>
        <p className="text-gray-500 text-lg">
          Đặc quyền dành riêng cho thành viên HPTShop.
        </p>
      </div>

      {/* Grid */}
      <Motion.motion.div
        className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {policies.map((policy, idx) => (
          <Motion.motion.div
            key={idx}
            variants={cardVariants}
            className="group flex flex-col items-start p-6 rounded-2xl border border-transparent hover:border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300"
          >
            <div className="mb-5 p-3 rounded-full bg-gray-50 text-gray-900 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
              {React.cloneElement(policy.icon, { size: 28 })}
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-red-600 transition-colors">
              {policy.title}
            </h3>
            <p className="text-gray-500 leading-relaxed text-sm md:text-base">
              {policy.description}
            </p>
          </Motion.motion.div>
        ))}
      </Motion.motion.div>

      {/* Footer Note */}
      <div className="max-w-2xl mx-auto mt-20 text-center border-t border-gray-100 pt-8">
        <p className="text-gray-400 text-sm">
          * Chính sách có thể thay đổi tùy theo từng thời điểm. Vui lòng đăng
          nhập để kiểm tra hạng thành viên của bạn.
        </p>
      </div>
    </div>
  );
}
