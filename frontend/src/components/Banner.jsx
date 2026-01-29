import React, { useState, useEffect } from "react";

// Slider component
const AutoSlider = ({ slides = [], autoInterval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!slides.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoInterval);
    return () => clearInterval(interval);
  }, [slides, autoInterval]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map(({ id, url }) => (
          <div key={id} className="w-full flex-shrink-0 relative">
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* Prev / Next buttons */}
      {["prev", "next"].map((dir) => (
        <button
          key={dir}
          onClick={() =>
            setCurrentIndex((prev) =>
              dir === "prev"
                ? prev === 0
                  ? slides.length - 1
                  : prev - 1
                : (prev + 1) % slides.length,
            )
          }
          className={`absolute top-1/2 ${
            dir === "prev" ? "left-4" : "right-4"
          } transform -translate-y-1/2 p-3 bg-white/50 hover:bg-white rounded-full transition z-10`}
        >
          <span className="text-xl">{dir === "prev" ? "<" : ">"}</span>
        </button>
      ))}

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-3 rounded-full transition-all ${
              idx === currentIndex ? "bg-white w-5" : "bg-gray-400 w-3"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Component phụ hiển thị ảnh
const SideImage = ({ src, alt }) => (
  <div className="flex-1 relative overflow-hidden rounded-lg bg-gray-200">
    <img src={src} alt={alt} className="w-full h-full object-cover" />
  </div>
);

// Main banner
const BannerQuangCao = () => {
  const sliderImages = [
    {
      id: 1,
      url: "https://res.cloudinary.com/dhbz4atrb/image/upload/v1769670677/myclothes/vutnl1rpnmiglbtbenm3.jpg",
    },
    {
      id: 2,
      url: "https://res.cloudinary.com/dhbz4atrb/image/upload/v1769670679/myclothes/bowxnwtsvbfqobumdsk4.jpg",
    },
    {
      id: 3,
      url: "https://res.cloudinary.com/dhbz4atrb/image/upload/v1769670681/myclothes/a1ly89yuukrfswdv63vk.jpg",
    },
  ];

  const sideImagesRight = [
    {
      src: "https://res.cloudinary.com/dhbz4atrb/image/upload/v1769670682/myclothes/wpds0bgapesrokk6mubv.jpg",
      alt: "banner-right-top",
    },
    {
      src: "https://res.cloudinary.com/dhbz4atrb/image/upload/v1769670683/myclothes/tiabtvofzsc8foa7ecaa.jpg",
      alt: "banner-right-bottom",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-[15px] bg-white shadow-xl rounded-lg my-8">
      <div className="flex flex-col lg:flex-row h-[500px] space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Slider chiếm 80% */}
        <div className="w-full lg:w-4/5 h-full">
          <AutoSlider slides={sliderImages} />
        </div>

        {/* Side images chiếm 20% */}
        <div className="w-full lg:w-1/5 h-full flex flex-col space-y-4">
          {sideImagesRight.map((img, i) => (
            <SideImage key={i} {...img} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerQuangCao;
