"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Minus,
  Plus,
  Share2,
  ThumbsUp,
  Tag,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Page({ params }) {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const unwrappedParams = use(params);
  const productId = unwrappedParams.id;

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [showMore, setShowMore] = useState(false);

  // 1 hour countdown
  const [timeLeft, setTimeLeft] = useState(60 * 60);

  // Load product from public API
  useEffect(() => {
    async function fetchProduct() {
      try {
        setIsLoading(true);
        const res = await axios.get(`/api/products/${productId}`);
        if (res.data?.success && res.data?.data) {
          const p = res.data.data;
          setProduct(p);
          if (p.attributes && Array.isArray(p.attributes)) {
            const initial = {};
            p.attributes.forEach((attr) => {
              if (attr.name && attr.options?.length > 0) {
                const firstOpt = attr.options[0];
                initial[attr.name] = typeof firstOpt === "string" ? firstOpt : firstOpt.label;
              }
            });
            setSelectedAttributes(initial);
          }
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const basePrice = product ? Number(product.price || 0) : 0;
  let attributePricesSum = 0;
  let hasAttributePrice = false;

  if (product?.attributes && Array.isArray(product.attributes)) {
    product.attributes.forEach((attr) => {
      const chosen = selectedAttributes[attr.name];
      const matched = attr.options?.find(
        (o) => (typeof o === "string" ? o : o.label) === chosen
      );
      if (
        matched &&
        typeof matched === "object" &&
        matched.price !== null &&
        matched.price !== undefined &&
        matched.price !== "" &&
        Number(matched.price) > 0
      ) {
        attributePricesSum += Number(matched.price);
        hasAttributePrice = true;
      }
    });
  }

  const effectiveUnitPrice = hasAttributePrice ? attributePricesSum : basePrice;
  const price = effectiveUnitPrice * quantity;
  const formattedPrice = price.toLocaleString("en-BD");

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://example.com/product/${productId}`;

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const countdownHours = Math.floor(timeLeft / 3600);
  const countdownMinutes = Math.floor((timeLeft % 3600) / 60);
  const countdownSeconds = timeLeft % 60;

  const formattedCountdown = `${String(countdownHours).padStart(
    2,
    "0"
  )}h ${String(countdownMinutes).padStart(2, "0")}m ${String(
    countdownSeconds
  ).padStart(2, "0")}s`;

  const changeQuantity = (amount) => {
    setQuantity((current) => Math.max(1, current + amount));
  };

  const handleCheckout = () => {
    const idToUse = product?._id || productId;
    const params = new URLSearchParams();
    params.set("productId", idToUse);
    params.set("qty", quantity.toString());
    if (Object.keys(selectedAttributes).length > 0) {
      params.set("attributes", JSON.stringify(selectedAttributes));
    }
    router.push(`/checkout?${params.toString()}`);
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.name || "Product",
      text: "Check out this product on Eflix",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Product link copied to clipboard!");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  };

  // SKELETON LOADER FOR PRODUCT PAGE
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-100 pb-24 text-neutral-900 transition-colors dark:bg-[#101010] dark:text-white md:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-5 md:py-6 lg:px-0">
          {/* Breadcrumb Skeleton */}
          <div className="h-5 w-48 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse mb-6" />

          <div className="mt-6 grid grid-cols-1 gap-8 lg:mt-7 lg:grid-cols-12 lg:gap-10">
            {/* LEFT COLUMN SKELETON */}
            <div className="lg:col-span-8 space-y-6">
              <div className="h-9 w-3/4 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="flex gap-3">
                <div className="h-7 w-20 rounded-md bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-7 w-28 rounded-md bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              </div>
              <div className="aspect-video w-full rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="h-44 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </div>

            {/* RIGHT COLUMN SKELETON */}
            <aside className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-6 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#181818] p-5 space-y-4">
                <div className="h-10 w-full rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-12 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-10 w-full rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-10 w-full rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-12 w-full rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              </div>
            </aside>
          </div>
        </div>
      </main>
    );
  }

  const productName = product?.name || "Product Details";
  const productImage =
    product?.image ||
    "/nodata.jpeg";
  const productCategory = product?.category || "General";
  const productStock = product?.stock !== undefined ? product.stock : 100;

  return (
    <main className="min-h-screen bg-gray-100 pb-28 text-neutral-900 transition-colors dark:bg-[#101010] dark:text-white lg:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-5 md:py-6 lg:px-0">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="text-sm text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator className="text-neutral-300 dark:text-neutral-600" />

            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/filter?category=${encodeURIComponent(productCategory)}`}
                className="text-sm text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                {productCategory}
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator className="text-neutral-300 dark:text-neutral-600" />

            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[180px] truncate text-sm text-neutral-500 dark:text-neutral-500">
                {productName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:mt-7 lg:grid-cols-12 lg:gap-10">
          {/* LEFT */}
          <div className="lg:col-span-8">
            {/* Product title */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold leading-tight tracking-tight text-neutral-900 sm:text-2xl md:text-3xl dark:text-white">
                  {productName}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4 sm:gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    98.4%
                  </span>

                  <a
                    href="#reviews"
                    className="text-sm text-neutral-500 underline transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  >
                    Verified Product
                  </a>

                  <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 px-3 py-1 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    <ShoppingCart className="h-3.5 w-3.5" />
                    {productStock > 0 ? `${productStock} in stock` : "Out of stock"}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleShare}
                variant="outline"
                className="hidden shrink-0 border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-white md:flex"
              >
                <Share2 className="mr-2 h-4 w-4" />
                {t("share")}
              </Button>
            </div>

            {/* Product image / post area */}
            <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 sm:mt-8">
              <div className="relative aspect-video w-full">
                <img
                  src={productImage}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            </div>

            {/* Details */}
            <section className="mt-8 rounded bg-neutral-50 p-4 dark:bg-[#181818]">
              <h2 className="text-xl font-semibold text-neutral-900 sm:text-2xl dark:text-white">
                {t("description")}
              </h2>

              <div className="relative mt-5">
                <div
                  className={`text-sm leading-7 text-neutral-700 dark:text-neutral-300 overflow-hidden transition-all duration-300 ${
                    !showMore ? "max-h-[165px]" : "max-h-none"
                  }`}
                >
                  {product?.description ? (
                    <div
                      className="prose dark:prose-invert max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  ) : (
                    <>
                      <p>
                        <strong>PACKAGE DETAILS:</strong> Standard delivery package
                      </p>
                      <p>
                        High-quality verified digital delivery. Fast fulfillment
                        directly to your email upon order confirmation.
                      </p>
                    </>
                  )}

                  <div className="mt-4 space-y-2 text-neutral-600 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-700 pt-3">
                    <p>• Delivery is initiated automatically upon valid checkout submission.</p>
                    <p>• 24/7 dedicated customer assistance available via WhatsApp and live chat.</p>
                    <p>• 100% money-back guarantee if credentials cannot be accessed.</p>
                  </div>
                </div>

                {!showMore && (
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-neutral-50 dark:from-[#181818] to-transparent" />
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowMore(!showMore)}
                className="mt-4 flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white transition-colors"
              >
                <span>{showMore ? (t("view_less") || "View less") : (t("view_more") || "View more")}</span>
                {showMore ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </section>

            {/* MOBILE PURCHASE OPTIONS */}
            <div className="mt-6 rounded-xl bg-neutral-50 p-4 dark:bg-[#181818] lg:hidden">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {t("purchase_options")}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {t("select_package")}
                  </p>
                </div>
                <Tag className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
              </div>

              {/* Quantity */}
              <div>
                <label className="mb-2 block text-sm text-neutral-600 dark:text-neutral-400">
                  {t("quantity")}
                </label>

                <div className="flex h-10 items-center overflow-hidden rounded-full border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-[#141414]">
                  <button
                    type="button"
                    onClick={() => changeQuantity(-1)}
                    className="flex h-full w-10 items-center justify-center text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex flex-1 justify-center text-sm font-medium text-neutral-900 dark:text-white">
                    {quantity}
                  </div>

                  <button
                    type="button"
                    onClick={() => changeQuantity(1)}
                    className="flex h-full w-10 items-center justify-center rounded-full bg-[#f51b25] text-white transition hover:bg-red-600"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic Attributes (if configured on product) */}
              {product?.attributes && product.attributes.length > 0 && (
                <div className="mt-3 space-y-3">
                  {product.attributes.map((attr, idx) => {
                    if (!attr.name || !attr.options?.length) return null;
                    return (
                      <div key={idx} className="mt-3">
                        <label className="mb-1.5 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                          <span className="font-medium text-neutral-800 dark:text-neutral-200">
                            {attr.name}
                          </span>
                        </label>

                        <select
                          value={selectedAttributes[attr.name] || ""}
                          onChange={(e) =>
                            setSelectedAttributes((prev) => ({
                              ...prev,
                              [attr.name]: e.target.value,
                            }))
                          }
                          className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                        >
                          {attr.options.map((opt, oIdx) => {
                            const label = typeof opt === "string" ? opt : opt.label;
                            const optPrice =
                              typeof opt === "object" && opt.price
                                ? ` (৳${Number(opt.price).toLocaleString("en-BD")})`
                                : "";
                            return (
                              <option key={oIdx} value={label}>
                                {label}{optPrice}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Price & Checkout */}
              <div className="mt-5 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  {t("total")}
                </span>
                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                  ৳{formattedPrice} BDT
                </span>
              </div>

              <Button
                className="mt-4 h-11 w-full rounded-lg bg-[#f51b25] px-4 text-sm font-semibold text-white hover:bg-red-600"
                onClick={handleCheckout}
              >
                {t("proceed_checkout")}
              </Button>
            </div>
          </div>

          {/* DESKTOP CHECKOUT ASIDE */}
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-6 overflow-hidden rounded-xl bg-white dark:bg-[#181818] shadow-lg border border-neutral-200 dark:border-neutral-800">
              {/* Promo */}
              <div className="bg-[#f51b25] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-red-600">
                    <Tag className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-4 text-white">
                      {t("special_offer")}
                    </p>
                  </div>

                  <span className="ml-auto whitespace-nowrap text-[10px] font-medium text-white sm:text-xs">
                    {timeLeft > 0 ? formattedCountdown : t("available")}
                  </span>
                </div>
              </div>

              <div className="p-4">
                {/* Available */}
                <p className="text-center text-xs text-neutral-500">
                  {productStock > 0 ? `${productStock} ${t("available")}` : t("limited_stock")}
                </p>

                {/* Quantity */}
                <div className="mt-3">
                  <label className="mb-1.5 block text-xs text-neutral-600 dark:text-neutral-400">
                    {t("quantity")}
                  </label>

                  <div className="flex h-10 items-center overflow-hidden rounded-full border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-[#141414]">
                    <button
                      type="button"
                      onClick={() => changeQuantity(-1)}
                      className="flex h-full w-10 items-center justify-center text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex flex-1 justify-center text-sm font-medium text-neutral-900 dark:text-white">
                      {quantity}
                    </div>

                    <button
                      type="button"
                      onClick={() => changeQuantity(1)}
                      className="flex h-full w-10 items-center justify-center rounded-full bg-[#f51b25] text-white transition hover:bg-red-600"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Dynamic Attributes (if configured on product) */}
                {product?.attributes && product.attributes.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {product.attributes.map((attr, idx) => {
                      if (!attr.name || !attr.options?.length) return null;
                      return (
                        <div key={idx} className="mt-3">
                          <label className="mb-1.5 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                            <span className="font-medium text-neutral-800 dark:text-neutral-200">
                              {attr.name}
                            </span>
                          </label>

                          <select
                            value={selectedAttributes[attr.name] || ""}
                            onChange={(e) =>
                              setSelectedAttributes((prev) => ({
                                ...prev,
                                [attr.name]: e.target.value,
                              }))
                            }
                            className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                          >
                            {attr.options.map((opt, oIdx) => {
                              const label = typeof opt === "string" ? opt : opt.label;
                              const optPrice =
                                typeof opt === "object" && opt.price
                                  ? ` (৳${Number(opt.price).toLocaleString("en-BD")})`
                                  : "";
                              return (
                                <option key={oIdx} value={label}>
                                  {label}{optPrice}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Price */}
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {t("total_amount")}
                  </span>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-semibold text-neutral-900 dark:text-white">
                      ৳{formattedPrice}
                    </span>
                    <span className="text-[10px] text-neutral-500">BDT</span>
                  </div>
                </div>

                {/* Checkout Button (Desktop) */}
                <Button
                  className="mt-4 hidden h-11 w-full rounded-lg bg-[#f51b25] px-4 text-sm font-semibold text-white hover:bg-red-600 lg:inline-flex lg:items-center lg:justify-center"
                  onClick={handleCheckout}
                >
                  {t("proceed_checkout")}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] backdrop-blur-md dark:border-neutral-800 dark:bg-[#181818]/95 lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 leading-tight">
              {t("total_amount")}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-neutral-900 dark:text-white">
                ৳{formattedPrice}
              </span>
              <span className="text-[10px] text-neutral-500 font-medium">BDT</span>
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            className="h-11 shrink-0 rounded-lg bg-[#f51b25] px-6 text-sm font-semibold text-white shadow-sm hover:bg-red-600"
          >
            {t("proceed_checkout")}
          </Button>
        </div>
      </div>
    </main>
  );
}
