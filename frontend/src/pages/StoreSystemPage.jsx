// src/pages/StoreSystemPage.jsx
import React from "react";
import { MapPin, Clock, Navigation, Phone, Star } from "lucide-react";
import * as Motion from "framer-motion";

export default function StoreSystemPage() {
  const stores = [
    {
      id: 1,
      name: "HPTSHOP Phú Nhuận",
      address: "112 Hồ Văn Huê, Phường 9, Quận Phú Nhuận, TP.HCM",
      hours: "09:00 - 21:00",
      phone: "0862 347 170",
      image:
        "https://res.cloudinary.com/dhbz4atrb/image/upload/v1766757003/myclothes/uq4xpulpznjadgosu3vh.jpg",
      rating: 4.9,
    },
    {
      id: 2,
      name: "HPTSHOP Tân Bình",
      address: "56 Cộng Hòa, Phường 4, Quận Tân Bình, TP.HCM",
      hours: "09:00 - 21:00",
      phone: "0862 347 170",
      image:
        "https://res.cloudinary.com/dhbz4atrb/image/upload/v1766757005/myclothes/jnhmmjldk0b0n0bef5hs.jpg",
      rating: 4.8,
    },
  ];

  const openGoogleMaps = (address) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address,
      )}`,
      "_blank",
    );
  };

  /* Animation */
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  const item = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="bg-white pt-28 pb-24">
      {/* HERO */}
      <section className="text-center mb-24 px-4">
        <Motion.motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl tracking-widest uppercase text-red-600 font-semibold"
        >
          Hệ thống showroom chính hãng
        </Motion.motion.span>

        <Motion.motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight"
        >
          Trải nghiệm mua sắm <br className="md:hidden" /> đẳng cấp
        </Motion.motion.h1>

        <Motion.motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-gray-500 max-w-2xl mx-auto text-base md:text-lg"
        >
          Không gian hiện đại, stylist cá nhân và dịch vụ chăm sóc khách hàng
          cao cấp tại từng showroom.
        </Motion.motion.p>
      </section>

      {/* STORE LIST */}
      <section className="max-w-screen-xl mx-auto px-4">
        <Motion.motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10"
        >
          {stores.map((store) => (
            <Motion.motion.article
              key={store.id}
              variants={item}
              className="group rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-500 bg-white"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 shadow">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold">{store.rating}/5</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 flex flex-col h-full">
                <h2 className="text-2xl font-bold mb-2">{store.name}</h2>
                <div className="w-10 h-1 bg-red-600 rounded-full mb-5" />

                <ul className="space-y-3 text-gray-600 text-sm">
                  <li className="flex gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                    <span>{store.address}</span>
                  </li>
                  <li className="flex gap-3">
                    <Clock className="w-5 h-5 text-gray-400 shrink-0" />
                    <span>
                      Giờ mở cửa:{" "}
                      <strong className="text-gray-900">{store.hours}</strong>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                    <a
                      href={`tel:${store.phone}`}
                      className="hover:text-red-600 transition"
                    >
                      Hotline:{" "}
                      <strong className="text-gray-900">{store.phone}</strong>
                    </a>
                  </li>
                </ul>

                <button
                  onClick={() => openGoogleMaps(store.address)}
                  className="mt-8 w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-xl font-semibold text-sm uppercase tracking-wide hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 transition-all group-hover:-translate-y-1"
                >
                  <Navigation className="w-4 h-4" />
                  Chỉ đường đến shop
                </button>
              </div>
            </Motion.motion.article>
          ))}
        </Motion.motion.div>
      </section>

      {/* WHY VISIT */}
      <section className="mt-28 bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-10">Vì sao nên ghé showroom?</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "👗",
                title: "Thử đồ trực tiếp",
                desc: "Cảm nhận chất liệu và form dáng chính xác nhất.",
              },
              {
                icon: "✨",
                title: "Stylist cá nhân",
                desc: "Tư vấn phối đồ phù hợp vóc dáng & phong cách.",
              },
              {
                icon: "🎁",
                title: "Ưu đãi độc quyền",
                desc: "Nhận voucher & quà tặng khi mua tại cửa hàng.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center text-2xl">
                  {item.icon}
                </div>
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
