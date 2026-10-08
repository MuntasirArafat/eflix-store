"use client";

import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

const banners = [
  {
    id: 1,
    image: "/banner.png",
    alt: "Eflix Store - Premium Entertainment & AI Subscriptions",
    link: "/filter",
  },
  {
    id: 2,
    image: "/banner3.webp",
    alt: "Gaming, Music & Creative Subscriptions with Instant Delivery",
    link: "/filter",
  },
];

export default function HeroBanner() {
  return (
    <div className="relative w-full overflow-hidden bg-black select-none group">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        speed={800}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={{
          nextEl: ".hero-swiper-next",
          prevEl: ".hero-swiper-prev",
        }}
        className="w-full hero-banner-swiper"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner.id}>
            <Link
              href={banner.link}
              className="block relative w-full h-[180px] xs:h-[220px] sm:h-[320px] md:h-[420px] lg:h-[500px] xl:h-[580px] 2xl:h-[650px] overflow-hidden"
            >
              <img
                src={banner.image}
                alt={banner.alt}
                loading={index === 0 ? "eager" : "lazy"}
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
              />
              {/* Subtle bottom gradient shadow for sleek aesthetic */}
              <div className="absolute inset-x-0 bottom-0 h-16 sm:h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </Link>
          </SwiperSlide>
        ))}

        {/* Custom Navigation Arrows */}
        <button
          type="button"
          className="hero-swiper-prev absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#f51b25] hover:scale-110 hover:border-transparent active:scale-95 shadow-lg"
          aria-label="Previous Slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          type="button"
          className="hero-swiper-next absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#f51b25] hover:scale-110 hover:border-transparent active:scale-95 shadow-lg"
          aria-label="Next Slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </Swiper>
    </div>
  );
}
