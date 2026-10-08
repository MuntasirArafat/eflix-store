"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import HeroBanner from "../component/HeroBanner";
import WhatsAppChat from "../component/WhatsAppChat";
import Category from "../component/Category";
import HomeCategorySections from "../component/HomeCategorySections";
import CategorySection from "../component/CategorySection";
import { useLanguage } from "@/context/LanguageContext";
import {
  Shield,
  Clock2,
  Star,
  Award
} from "lucide-react";

export default function Home() {
  const { lang, t } = useLanguage();
  const [supportWhatsAppUrl, setSupportWhatsAppUrl] = useState("");

  useEffect(() => {
    let ignore = false;
    async function fetchSupportLink() {
      try {
        const res = await axios.get("/api/settings");
        if (!ignore && res.data?.success && res.data?.data?.whatsapp) {
          const w = res.data.data.whatsapp;
          const rawNum = w.number || w.phoneNumber;
          if (rawNum) {
            const cleanNum = String(rawNum).replace(/[^0-9]/g, "");
            const msg =
              typeof w.message === "string" && w.message.trim()
                ? w.message.trim()
                : "";
            if (cleanNum) {
              setSupportWhatsAppUrl(
                `https://wa.me/${cleanNum}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`
              );
            }
          }
        }
      } catch {
        // Fallback
      }
    }
    fetchSupportLink();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <HeroBanner />

      {/** Banner Trust Badges */}
      <div className="overflow-x-auto md:overflow-visible scrollbar-hide">
        <div className="flex md:grid md:grid-cols-4 border-b border-[#2e2e2e] p-3 sm:p-4 md:p-6 md:px-8 gap-3 sm:gap-4 md:gap-6 w-max md:w-full">
          {/* Gamer Protection */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-[220px] sm:min-w-[240px] md:min-w-0 cursor-pointer">
            <div className="bg-[#171717] shadow h-9 w-9 sm:h-10 sm:w-10 rounded flex justify-center items-center shrink-0">
              <Shield className="text-gray-400 w-4 h-4 sm:w-[16px] sm:h-[16px]" />
            </div>

            <div className="min-w-0">
              <p className="text-xs sm:text-sm md:text-base font-medium truncate text-white">
                {lang === "bn" ? "ভেরিফাইড প্ল্যাটফর্ম" : "GamerProtected"}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 whitespace-nowrap">
                {lang === "bn" ? "প্রতিটি লেনদেনে শতভাগ সুরক্ষা" : "Every Transaction Covered"}
              </p>
            </div>
          </div>

          {/* Instant Delivery */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-[220px] sm:min-w-[240px] md:min-w-0 cursor-pointer">
            <div className="bg-[#171717] shadow h-9 w-9 sm:h-10 sm:w-10 rounded flex justify-center items-center shrink-0">
              <Clock2 className="text-gray-400 w-4 h-4 sm:w-[16px] sm:h-[16px]" />
            </div>

            <div className="min-w-0">
              <p className="text-xs sm:text-sm md:text-base font-medium truncate text-white">
                {t("instant_delivery")}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 whitespace-nowrap">
                {lang === "bn" ? "অধিকাংশ অর্ডার ৫ মিনিটে ডেলিভারি" : "80% of orders under 5 min"}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-[220px] sm:min-w-[240px] md:min-w-0 cursor-pointer">
            <div className="bg-[#171717] shadow h-9 w-9 sm:h-10 sm:w-10 rounded flex justify-center items-center shrink-0">
              <Star className="text-gray-400 w-4 h-4 sm:w-[16px] sm:h-[16px]" />
            </div>

            <div className="min-w-0">
              <p className="text-xs sm:text-sm md:text-base font-medium truncate text-white">
                {lang === "bn" ? "৪.৭ / ৫ রেটিং" : "4.7 / 5 Rating"}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 whitespace-nowrap">
                {lang === "bn" ? "৫,০০০+ গ্রাহকের বিশ্বস্ত মতামত" : "From 5K+ verified reviews"}
              </p>
            </div>
          </div>

          {/* Support */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-[220px] sm:min-w-[240px] md:min-w-0 cursor-pointer">
            <div className="bg-[#171717] shadow h-9 w-9 sm:h-10 sm:w-10 rounded flex justify-center items-center shrink-0">
              <Award className="text-gray-400 w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </div>

            <div className="min-w-0">
              <p className="text-xs sm:text-sm md:text-base font-medium truncate text-white">
                {t("support_24_7")}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 whitespace-nowrap">
                {lang === "bn" ? "যে কোনো প্রয়োজনে সার্বক্ষণিক সেবা" : "Ready to Help You Anytime"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <CategorySection />

      <div className="p-4 md:p-8">
        <Category title={t("featured_products")} limit={4} featured={true} />
        <HomeCategorySections />
        <Category
          title={lang === "bn" ? "নতুন যুক্ত হওয়া সাবস্ক্রিপশন" : "All Recent Arrivals"}
          limit={4}
        />
      </div>

      {/* Trust Info Banner */}
      <div>
        <div className="grid grid-cols-12 gap-2 w-full items-center mt-6 bg-[#171717]">
          <div className="md:p-12 p-6 col-span-12 md:col-span-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              {lang === "bn" ? "নিরাপদ ও সহজ ডিজিটাল সেবা" : "Safe and easy trading"}
            </h2>
            <p className="md:text-xl text-base text-gray-400 leading-relaxed">
              {lang === "bn"
                ? "কোনো প্রকার অনিশ্চয়তা ছাড়াই সাবস্ক্রিপশন কিনুন। Eflix গ্যারান্টি দেয় প্রতিটি অ্যাকাউন্টের স্থায়িত্ব ও শতভাগ নিরাপত্তা। দ্রুত অর্ডার করুন, পেমেন্ট সম্পন্ন করুন এবং সাথে সাথে অ্যাকাউন্ট বুঝে নিন।"
                : "Trade without fear - Eflix guarantees that all digital accounts are legitimate, secured, and hassle-free. Pick your favorite subscription, pay securely, receive your order instantly, and start streaming right away."}
            </p>
          </div>

          <div className="col-span-12 md:col-span-6 rounded-lg items-center justify-center flex p-4">
            <Image
              src="/phone.webp"
              alt="Eflix Digital Store"
              width={450}
              height={300}
              className="w-[400px] h-[350px] md:w-[500px] md:h-[450px] object-contain"
            />
          </div>
        </div>

        {/* Footer Guarantee Blocks */}
        <div className="grid grid-cols-12 gap-4 w-full p-4 md:p-8 my-6">
          <div className="bg-[#FBE7B6] p-8 col-span-12 md:col-span-6 rounded-xl text-black">
            <div className="grid grid-cols-12 gap-4 w-full items-center">
              <div className="col-span-12 md:col-span-4 flex justify-center md:justify-start">
                <Image
                  src="/trade-shield.svg"
                  alt="Money Back"
                  width={150}
                  height={150}
                  className="w-[80px] h-[80px] md:w-[120px] md:h-[120px]"
                />
              </div>
              <div className="col-span-12 md:col-span-8">
                <h2 className="text-2xl font-semibold mb-2 text-black">
                  {lang === "bn" ? "মানিব্যাক গ্যারান্টি" : "Money-back guarantee"}
                </h2>
                <p className="mb-4 text-sm text-neutral-800">
                  {lang === "bn"
                    ? "সঠিকভাবে অ্যাকাউন্ট বুঝে নিন বা সম্পূর্ণ রিফান্ড পান। আপনার প্রতি লেনদেনে আমাদের পূর্ণ গ্যারান্টি।"
                    : "Receive your account on time or get a full refund. Feel safe with 100% purchase protection."}
                </p>
                <button
                  type="button"
                  className="bg-[#FFC950] text-sm md:text-base hover:bg-[#FFC950]/80 text-black font-semibold py-2 px-4 rounded-lg"
                >
                  {lang === "bn" ? "বিস্তারিত জানুন" : "Learn more"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 col-span-12 md:col-span-6 bg-[#D1F08F] rounded-xl text-black">
            <div className="grid grid-cols-12 gap-4 w-full items-center">
              <div className="col-span-12 md:col-span-4 flex justify-center md:justify-start">
                <Image
                  src="/chat-support.svg"
                  alt="Chat Support"
                  width={150}
                  height={150}
                  className="w-[80px] h-[80px] md:w-[120px] md:h-[120px]"
                />
              </div>
              <div className="col-span-12 md:col-span-8">
                <h2 className="text-2xl font-semibold mb-2 text-black">
                  {lang === "bn" ? "২৪/৭ লাইভ সাপোর্ট" : "24/7 live support"}
                </h2>
                <p className="mb-4 text-sm text-neutral-800">
                  {lang === "bn"
                    ? "যেকোনো সমস্যায় আমাদের সাপোর্ট টিম সারাক্ষণ প্রস্তুত। হোয়াটসঅ্যাপে মেসেজ দিয়ে সহায়তা নিন।"
                    : "Eflix customer support operates around the clock. Contact us anytime for instant assistance."}
                </p>
                <a
                  href={supportWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#FFC950] text-sm md:text-base hover:bg-[#FFC950]/80 text-black font-semibold py-2 px-4 rounded-lg"
                >
                  {lang === "bn" ? "চ্যাট করুন" : "Chat now"}
                </a>
              </div>
            </div>
          </div>
        </div>

        <WhatsAppChat />
      </div>
    </>
  );
}
