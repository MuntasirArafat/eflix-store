"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, ArrowRight } from "lucide-react";

const categories = [


   {
    id: "streaming",
    name: "Streaming",
    description: "Save more on everyday purchases",
    slug: "streaming",
    iconUrl:
      "/netflix.png",
    subcategories: [
      { name: "Netflix", slug: "netflix", icon: "🎬" },
      { name: "Prime Video", slug: "primevideo", icon: "📺" },
      { name: "Disney+", slug: "disneyplus", icon: "🏰" },
      { name: "HBO Max", slug: "hbomax", icon: "🎥" },
      { name: "Apple TV+", slug: "appletv", icon: "🍎" },
      { name: "Crunchyroll", slug: "crunchyroll", icon: "🍥" },
    ],
  },
    {
  id: "ai-tools",
  name: "AI & Tools",
  description: "Powerful AI tools for work, creativity & productivity",
  slug: "ai-tools",
  iconUrl: "/edu.webp",
  subcategories: [
    {
      name: "ChatGPT",
      slug: "chatgpt",
      icon: "🤖",
    },
    {
      name: "Gemini",
      slug: "gemini",
      icon: "✨",
    },
    {
      name: "Canva Pro",
      slug: "canva-pro",
      icon: "🎨",
    },
    {
    name: "Claude",
    slug: "claude",
    icon: "🧠",
  },
  {
    name: "Microsoft Copilot",
    slug: "microsoft-copilot",
    icon: "💡",
  },
  {
    name: "Perplexity",
    slug: "perplexity",
    icon: "🔎",
  },
  ],
},
{
  id: "gaming-music",
  name: "Gaming & Music",
  description: "Games, music and entertainment all in one place",
  slug: "gaming-music",
  iconUrl: "/joy.webp",
  subcategories: [
    { name: "Top Up", slug: "game-top-up", icon: "🎮" },
    { name: "Game Accounts", slug: "game-accounts", icon: "👾" },
    { name: "Spotify Premium", slug: "spotify-premium", icon: "🎵" },
    { name: "YouTube Music", slug: "youtube-music", icon: "🎧" },
    { name: "Apple Music", slug: "apple-music", icon: "🎶" },
  ],
},

{
  id: "software",
  name: "Software & Apps",
  description: "Essential tools for work, creativity and productivity",
  slug: "software",
  iconUrl: "/pc.webp",
  subcategories: [
    {
      name: "Microsoft 365",
      slug: "microsoft-365",
      icon: "💼",
    },
    {
      name: "Adobe Creative Cloud",
      slug: "adobe-creative-cloud",
      icon: "🎨",
    },
    {
      name: "Canva Pro",
      slug: "canva-pro",
      icon: "🖌️",
    },
    {
      name: "VPN",
      slug: "vpn-security",
      icon: "🔐",
    },
    {
      name: "Cloud Storage",
      slug: "cloud-storage",
      icon: "☁️",
    },
    {
      name: "Productivity Tools",
      slug: "productivity-tools",
      icon: "⚡",
    },
  ],
},

 {
  id: "gift-cards",
  name: "Gift Cards",
  description: "Secure solutions for digital finance",
  slug: "gift-cards",
  iconUrl: "/gift.png",
  subcategories: [
    {
      name: "Amazon Gift Card",
      slug: "amazon-gift-card",
      icon: "🎁",
    },
    {
      name: "Google Play",
      slug: "google-play",
      icon: "🎮",
    },
    {
      name: "Apple Gift Card",
      slug: "apple-gift-card",
      icon: "🍎",
    },
  ],
},

];

export default function CategorySection() {
  const [openCategory, setOpenCategory] = useState(categories[0]?.id || "streaming");

  const handleToggle = (id) => {
    setOpenCategory((current) => {
      if (current === id) {
        return null;
      }

      return id;
    });
  };

  return (
    <section className="w-full mt-5 mb-6">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-gray-950 dark:text-white">
              Explore Categories
            </h2>

            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Find everything you need in one place
            </p>
          </div>

          <Link
            href="/filter"
            className="group flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-[#2d2d2d] dark:bg-[#171717] dark:text-gray-200 dark:hover:border-[#444] dark:hover:bg-[#1d1d1d]"
          >
            View All

            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-5">
          {categories.map((category) => {
            const isOpen = openCategory === category.id;

            return (
              <div
                key={category.id}
                className="
                  group relative overflow-hidden rounded-xl
                  border border-gray-200 bg-white
                  transition-all duration-300
                  hover:shadow-[0_10px_30px_-8px_rgba(237,28,37,0.25)]
                  dark:border-[#242424] dark:bg-[#171717]
                  dark:hover:shadow-[0_10px_30px_-8px_rgba(237,28,37,0.22)]
                "
              >
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => handleToggle(category.id)}
                  aria-expanded={isOpen}
                  className="
                    relative flex w-full items-center gap-3
                    px-4 py-4 text-left
                    lg:pointer-events-none
                    lg:px-5 lg:py-4
                  "
                >
                  {/* Category Icon */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                    <img
                      src={category.iconUrl}
                      alt={category.name}
                      className="
                        h-11 w-11 object-contain
                        transition-transform duration-300
                        group-hover:scale-105
                      "
                    />
                  </div>

                  {/* Category Text */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[17px] font-medium leading-tight text-gray-900 dark:text-white">
                      {category.name}
                    </h3>

                    <p className="mt-0.5 text-xs text-gray-500 dark:text-[#9b9b9b]">
                      {category.description}
                    </p>
                  </div>

                  {/* Mobile Toggle */}
                  <span className="flex shrink-0 lg:hidden">
                    {isOpen ? (
                      <ChevronUp
                        size={18}
                        strokeWidth={2}
                        className="text-gray-400"
                      />
                    ) : (
                      <ChevronDown
                        size={18}
                        strokeWidth={2}
                        className="text-gray-400"
                      />
                    )}
                  </span>
                </button>

                {/* Divider */}
                <div
                  className={`mx-4 border-t border-gray-200 dark:border-[#292929] lg:mx-5 ${
                    isOpen ? "block" : "hidden lg:block"
                  }`}
                />

                {/* Subcategories */}
                <div
                  className={`
                    px-4 pb-4 pt-4
                    lg:block lg:px-5 lg:pb-5 lg:pt-4
                    ${isOpen ? "block" : "hidden"}
                  `}
                >
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.slug}
                        href={`/filter?search=${encodeURIComponent(subcategory.name)}`}
                        className="
                          inline-flex min-h-[42px] items-center gap-1.5
                          rounded-xl border border-gray-300
                          bg-transparent px-3 py-2
                          text-[13px] text-gray-800
                          transition-all duration-200
                          hover:border-gray-400
                          hover:bg-gray-50
                          dark:border-[#414141]
                          dark:text-[#eeeeee]
                          dark:hover:border-[#5a5a5a]
                          dark:hover:bg-[#202020]
                        "
                      >
                        <span className="whitespace-nowrap">
                          {subcategory.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}