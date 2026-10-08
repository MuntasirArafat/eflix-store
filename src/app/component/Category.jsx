"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useLanguage } from "@/context/LanguageContext";

function Category({
  title = "Continue Browsing",
  categoryName = "",
  limit = 4,
  featured = null,
  hideIfEmpty = false,
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (categoryName) params.append("category", categoryName);
        if (featured !== null && featured !== undefined) {
          params.append("featured", featured.toString());
        }
        params.append("limit", limit.toString());

        const res = await axios.get(`/api/products?${params.toString()}`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load products in Category component:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [categoryName, limit, featured]);

  const viewAllHref = featured
    ? "/filter?featured=true"
    : categoryName
    ? `/filter?category=${encodeURIComponent(categoryName)}`
    : "/filter";

  if (!isLoading && products.length === 0 && (featured || hideIfEmpty)) {
    return null;
  }

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-neutral-900 md:text-2xl dark:text-white">
          {title}
        </h2>

        <Link
          href={viewAllHref}
          className="
            group
            flex items-center gap-1.5
            rounded-lg
            border border-neutral-200
            bg-white
            px-4 py-2
            text-sm font-medium
            text-neutral-700
            shadow-sm
            transition
            duration-200
            hover:bg-neutral-50
            hover:text-neutral-900
            dark:border-neutral-700
            dark:bg-[#171717]
            dark:text-neutral-300
            dark:hover:bg-[#1c1c1c]
            dark:hover:text-white
          "
        >
          {t("view_all")}
          <ArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      {/* SKELETON LOADER FOR PRODUCTS */}
      {isLoading ? (
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: limit }).map((_, idx) => (
            <div
              key={idx}
              className="
                overflow-hidden
                rounded-lg
                border border-neutral-200
                bg-white
                shadow-sm
                dark:border-neutral-800
                dark:bg-[#171717]
              "
            >
              <div className="aspect-square w-full bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-lg" />
              <div className="p-2 space-y-2 mt-2">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-3/4 mx-2" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-1/2 mx-2" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-1/3 mx-2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {t("no_products")}
        </div>
      ) : (
        /* Product cards */
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product._id || product.id}
              onClick={() => router.push(`/product/${product._id || product.slug}`)}
              className="
                group
                cursor-pointer
                overflow-hidden
                rounded-lg
                border border-neutral-200
                bg-white
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-neutral-300
                hover:shadow-md
                dark:border-neutral-800
                dark:bg-[#171717]
                dark:hover:border-neutral-700
                dark:hover:bg-[#1c1c1c]
                dark:hover:shadow-lg
              "
            >
              {/* Product image */}
              <div className="overflow-hidden">
                <img
                  src={
                    product.image ||
                    "/nodata.jpeg"
                  }
                  alt={product.name || product.title}
                  className="
                    aspect-square
                    w-full
                    rounded-lg
                    object-cover
                    transition-transform
                    duration-300
                    group-hover:scale-[1.02]
                  "
                />
              </div>

              {/* Product information */}
              <div className="p-2">
                <h3 className="px-2 text-sm font-medium leading-5 text-neutral-900 md:text-base dark:text-white truncate">
                  {product.name || product.title}
                </h3>

                <p className="mb-2 line-clamp-1 px-2 text-xs text-neutral-500 md:text-sm dark:text-neutral-400">
                  {product.category || product.description?.replace(/<[^>]*>?/gm, "") || ""}
                </p>

                <p className="mb-2 px-2 text-sm font-semibold text-neutral-900 md:text-base dark:text-white">
                  ৳ {Number(product.price || 0).toLocaleString("en-BD")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Category;
