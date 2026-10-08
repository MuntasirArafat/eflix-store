"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Check,
  CreditCard,
  Mail,
  Phone,
  Smartphone,
  User,
  TicketPercent,
  Loader2,
  Copy,
  X,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/context/LanguageContext";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const productId = searchParams.get("productId") || searchParams.get("id");
  const quantity = Math.max(parseInt(searchParams.get("qty") || "1"), 1);
  const months = Math.max(parseInt(searchParams.get("months") || "1"), 1);
  const screens = Math.max(parseInt(searchParams.get("screens") || "1"), 1);

  const rawAttributes = searchParams.get("attributes");
  let parsedAttributes = null;
  try {
    if (rawAttributes) parsedAttributes = JSON.parse(rawAttributes);
  } catch (e) {}

  const [product, setProduct] = useState(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(Boolean(productId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpeningModal, setIsOpeningModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const [paymentSettings, setPaymentSettings] = useState({
    bkash: { number: "017235355435", type: "Personal" },
    nagad: { number: "01711426565", type: "Personal" },
    rocket: { number: "01711426565", type: "Personal" },
  });

  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    transactionId: "",
  });

  // Fetch payment settings from backend
  useEffect(() => {
    async function loadPaymentSettings() {
      try {
        const res = await axios.get("/api/settings");
        if (res.data?.success && res.data?.data?.payments) {
          setPaymentSettings(res.data.data.payments);
        }
      } catch (err) {
        console.error("Failed to load payment settings:", err);
      }
    }
    loadPaymentSettings();
  }, []);

  // Fetch product if productId is in query
  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      try {
        setIsLoadingProduct(true);
        const res = await axios.get(`/api/products/${productId}`);
        if (res.data?.success && res.data?.data) {
          setProduct(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load checkout product:", err);
      } finally {
        setIsLoadingProduct(false);
      }
    }
    loadProduct();
  }, [productId]);

  const basePrice = product ? Number(product.price || 0) : 1200;
  let attributePricesSum = 0;
  let hasAttributePrice = false;

  if (product?.attributes && parsedAttributes) {
    product.attributes.forEach((attr) => {
      const chosen = parsedAttributes[attr.name];
      const matched = attr.options?.find(
        (o) => (typeof o === "string" ? o : o.label) === chosen,
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

  const unitPrice = hasAttributePrice ? attributePricesSum : basePrice;

  const price = parsedAttributes
    ? unitPrice * quantity
    : searchParams.get("months")
      ? unitPrice * months * quantity
      : unitPrice * quantity;

  const [couponData, setCouponData] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const discount = couponData?.discountAmount || 0;
  const total = Math.max(price - discount, 0);

  const formattedPrice = price.toLocaleString("en-BD");
  const formattedDiscount = discount.toLocaleString("en-BD");
  const formattedTotal = total.toLocaleString("en-BD");

  const selectedConfig = paymentSettings[paymentMethod] || {
    number: "01711426565",
    type: "Personal",
  };
  const methodName =
    paymentMethod === "bkash"
      ? "bKash"
      : paymentMethod === "nagad"
        ? "Nagad"
        : "Rocket";

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCoupon = async () => {
    const code = coupon.trim().toUpperCase();

    if (!code) {
      setCouponError("Please enter a coupon code.");
      setCouponApplied(false);
      setCouponData(null);
      return;
    }

    try {
      setIsValidatingCoupon(true);
      setCouponError("");
      const res = await axios.post("/api/coupons/validate", {
        code,
        subtotal: price,
      });

      if (res.data?.success && res.data?.data) {
        setCouponApplied(true);
        setCouponData(res.data.data);
        setCouponError("");
      } else {
        setCouponApplied(false);
        setCouponData(null);
        setCouponError(res.data?.message || "Invalid coupon code.");
      }
    } catch (err) {
      setCouponApplied(false);
      setCouponData(null);
      setCouponError(err.response?.data?.message || "Failed to apply coupon.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCoupon("");
    setCouponApplied(false);
    setCouponData(null);
    setCouponError("");
  };

  const copyNumber = (num) => {
    if (!num) return;
    navigator.clipboard.writeText(num);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleInitiateOrder = (e) => {
    if (e) e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      alert("Please fill in your name, email, and phone number.");
      return;
    }

    setIsOpeningModal(true);
    setTimeout(() => {
      setIsOpeningModal(false);
      setIsModalOpen(true);
      setModalError("");
    }, 500);
  };

  const handleConfirmOrder = async (e) => {
    if (e) e.preventDefault();

    if (!form.transactionId.trim()) {
      setModalError("Please enter the payment Transaction ID (TrxID).");
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError("");

      const orderPayload = {
        customer: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        paymentMethod: paymentMethod.toUpperCase(),
        transactionId: form.transactionId.trim().toUpperCase(),
        items: [
          {
            productId: product?._id || productId || undefined,
            name: product?.name || "Digital Package",
            price: unitPrice,
            quantity: quantity,
            image: product?.image || "",
            attributes: parsedAttributes || undefined,
          },
        ],
        subtotal: price,
        discount: discount,
        total: total,
        coupon: couponApplied && couponData ? couponData.code : undefined,
      };

      const res = await axios.post("/api/orders", orderPayload);

      if (res.data?.success && res.data?.data) {
        const orderNumber = res.data.data.orderNumber || res.data.data._id;
        router.push(`/Confirmation/${orderNumber}`);
      } else {
        setModalError(res.data?.message || "Failed to place order.");
      }
    } catch (err) {
      console.error("Order submission error:", err);
      setModalError(
        err.response?.data?.message ||
          "Failed to submit order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 pb-28 text-neutral-900 transition-colors dark:bg-[#101010] dark:text-white lg:pb-8">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-5 md:py-8 lg:px-0">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("secure_checkout")}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {t("checkout_subtitle")}
          </p>
        </div>

        <form id="checkout-form" onSubmit={handleInitiateOrder}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            {/* LEFT */}
            <div className="space-y-6 lg:col-span-7">
              {/* Customer Information */}
              <section className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#181818] sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-[#242424]">
                    <User className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold">
                      {t("customer_info")}
                    </h2>
                    <p className="text-xs text-neutral-500">
                      {t("customer_info_subtitle")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {t("name")} *
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <Input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder={t("enter_name")}
                        className="h-11 border-neutral-200 bg-neutral-50 pl-10 text-sm dark:border-neutral-700 dark:bg-[#111111]"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {t("email_delivery")}
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <Input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="you@example.com"
                        className="h-11 border-neutral-200 bg-neutral-50 pl-10 text-sm dark:border-neutral-700 dark:bg-[#111111]"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {t("phone_label")}
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <Input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="h-11 border-neutral-200 bg-neutral-50 pl-10 text-sm dark:border-neutral-700 dark:bg-[#111111]"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#181818] sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-[#242424]">
                    <CreditCard className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold">
                      {t("payment_method")}
                    </h2>
                    <p className="text-xs text-neutral-500">
                      {t("payment_channel_subtitle")}
                    </p>
                  </div>
                </div>

                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  {/* bKash */}
                  <label
                    className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-colors ${
                      paymentMethod === "bkash"
                        ? "border-[#f51b25] bg-red-50/20 dark:border-red-500 dark:bg-red-500/5"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="bkash" id="pm-bkash" />
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                        bKash
                      </span>
                    </div>
                    <img
                      src="/bkash-logo-white.png"
                      width={50}
                    />
                  </label>

                  {/* Nagad */}
                  <label
                    className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-colors ${
                      paymentMethod === "nagad"
                        ? "border-[#f51b25] bg-red-50/20 dark:border-red-500 dark:bg-red-500/5"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="nagad" id="pm-nagad" />
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Nagad
                      </span>
                    </div>
                    <img
                      src="/nagadlogowhitepng.png"
                      width={50}
                    />
                  </label>

                  {/* Rocket */}
                  <label
                    className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-colors ${
                      paymentMethod === "rocket"
                        ? "border-[#f51b25] bg-red-50/20 dark:border-red-500 dark:bg-red-500/5"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="rocket" id="pm-rocket" />
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Rocket
                      </span>
                    </div>
                    <img
                      src="/rocketwhite.webp"
                      width={40}
                    />
                  </label>
                </RadioGroup>
              </section>
            </div>

            {/* RIGHT - ORDER SUMMARY */}
            <aside className="lg:col-span-5">
              <div className="sticky top-6 overflow-hidden rounded-xl bg-white shadow-sm dark:bg-[#181818]">
                {/* Header */}
                <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                  <h2 className="text-base font-semibold">
                    {t("order_summary")}
                  </h2>
                </div>

                <div className="p-5">
                  {/* Product or Skeleton */}
                  {isLoadingProduct ? (
                    <div className="flex gap-4">
                      <div className="h-24 w-24 shrink-0 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                        <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                        <div className="h-4 w-1/4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse mt-3" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <img
                          src={
                            product?.image ||
                            "/nodata.jpeg"
                          }
                          alt={product?.name || "Product"}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold leading-5 text-neutral-900 dark:text-white line-clamp-2">
                          {product?.name || "Digital Account Subscription"}
                        </h3>

                        <p className="mt-1 text-xs text-neutral-500">
                          {product?.category || "Digital Service"}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {parsedAttributes ? (
                            Object.entries(parsedAttributes).map(([k, v]) => (
                              <span
                                key={k}
                                className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                              >
                                {k}: {v}
                              </span>
                            ))
                          ) : (
                            <>
                              {searchParams.get("months") && (
                                <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                  {months} {months === 1 ? "Month" : "Months"}
                                </span>
                              )}
                              {searchParams.get("screens") && (
                                <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                  {screens}{" "}
                                  {screens === 1 ? "Screen" : "Screens"}
                                </span>
                              )}
                            </>
                          )}
                          <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                            {t("quantity")}: {quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="my-5 h-px bg-neutral-200 dark:bg-neutral-800" />

                  {/* Coupon */}
                  <div>
                    <p className="mb-2 text-sm font-medium">
                      {t("coupon_code")}
                    </p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <TicketPercent className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <Input
                          value={coupon}
                          onChange={(e) => {
                            setCoupon(e.target.value);
                            setCouponError("");
                            setCouponApplied(false);
                          }}
                          placeholder={t("enter_coupon")}
                          className="h-10 border-neutral-200 bg-neutral-50 pl-9 text-sm uppercase dark:border-neutral-700 dark:bg-[#111111]"
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={handleCoupon}
                        disabled={isValidatingCoupon || !coupon.trim()}
                        variant="outline"
                        className="h-10 px-4 text-sm"
                      >
                        {isValidatingCoupon ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t("apply_coupon")
                        )}
                      </Button>
                    </div>

                    {couponApplied && couponData && (
                      <div className="mt-2.5 flex items-center justify-between text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Check className="h-4 w-4 shrink-0" />
                          <span>
                            {couponData.code} applied —{" "}
                            {couponData.discountType === "Percentage"
                              ? `${couponData.discountValue}% off`
                              : `৳${couponData.discountAmount} off`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="text-xs text-red-500 hover:text-red-400 ml-2 font-medium"
                        >
                          {t("remove")}
                        </button>
                      </div>
                    )}

                    {couponError && (
                      <p className="mt-2 text-xs text-red-500">{couponError}</p>
                    )}
                  </div>

                  <div className="my-5 h-px bg-neutral-200 dark:bg-neutral-800" />

                  {/* Price */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">
                        {t("product_price")}
                      </span>
                      <span className="font-medium">৳{formattedPrice}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">{t("quantity")}</span>
                      <span className="font-medium">× {quantity}</span>
                    </div>

                    {couponApplied && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600">{t("discount")}</span>
                        <span className="font-medium text-green-600">
                          -৳{formattedDiscount}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="my-5 h-px bg-neutral-200 dark:bg-neutral-800" />

                  {/* Total */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm font-medium">{t("total_amount")}</p>
                      <p className="mt-1 text-[10px] text-neutral-500">
                        {t("including_fees")}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold">৳{formattedTotal}</p>
                      <p className="text-[10px] text-neutral-500">BDT</p>
                    </div>
                  </div>

                  {/* Submit Button (Desktop) */}
                  <Button
                    type="submit"
                    disabled={isOpeningModal || isSubmitting}
                    className="mt-5 hidden h-11 w-full rounded-lg bg-[#f51b25] text-sm font-semibold text-white shadow-sm hover:bg-red-600 disabled:opacity-50 lg:flex lg:items-center lg:justify-center"
                  >
                    {isOpeningModal || isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("processing_order")}
                      </span>
                    ) : (
                      t("place_order")
                    )}
                  </Button>

                  <p className="mt-3 text-center text-[10px] leading-4 text-neutral-500">
                    {t("agree_terms_checkout")}
                  </p>
                </div>
              </div>
            </aside>
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
                    ৳{formattedTotal}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium">
                    BDT
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                disabled={isOpeningModal || isSubmitting}
                className="h-11 shrink-0 rounded-lg bg-[#f51b25] px-5 text-sm font-semibold text-white shadow-sm hover:bg-red-600 disabled:opacity-50"
              >
                {isOpeningModal || isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("processing_order")}
                  </span>
                ) : (
                  t("place_order")
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Payment Confirmation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-2xl transition-all dark:border-neutral-800 dark:bg-[#181818] sm:p-7">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded ${
                    paymentMethod === "bkash"
                      ? "bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400"
                      : paymentMethod === "nagad"
                        ? "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
                        : "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                  }`}
                >
                  <img
                    src={
                      paymentMethod === "bkash"
                        ? "/bkash.webp"
                        : paymentMethod === "nagad"
                          ? "/nagad.jpg"
                          : "/rocket.webp"
                    }
                    alt={paymentMethod}
                    className=" rounded object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {methodName} Payment
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Send Money & verify Transaction ID
                  </p>
                </div>
              </div>

              {/* Payment Details Card */}
              <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 dark:border-neutral-800 dark:bg-[#121212]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500">
                    Account Type
                  </span>
                  <span className="rounded-md bg-neutral-200 px-2 py-0.5 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    {selectedConfig.type || "Personal"}
                  </span>
                </div>

                {/* Phone Number with 1-Click Copy */}
                <div className="mt-3">
                  <div className="mt-1 flex items-center justify-between rounded-lg py-2  dark:border-neutral-700 ">
                    <span className="font-mono  tracking-wider text-neutral-900 dark:text-white">
                      {selectedConfig.number || "01711426565"}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyNumber(selectedConfig.number || "01711426565")
                      }
                      className="flex items-center gap-1.5 rounded-md bg-[#f51b25]/10 px-2.5 py-1 text-xs font-semibold text-[#f51b25] transition hover:bg-[#f51b25]/20 dark:bg-red-500/20 dark:text-red-400"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Total Payable */}
                <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3 dark:border-neutral-800">
                  <span className="text-xs font-medium text-neutral-500">
                    Total Payable
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">
                      ৳{formattedTotal}
                    </span>
                    <span className="text-[10px] text-neutral-500">BDT</span>
                  </div>
                </div>
              </div>

              {/* Instruction Note */}
              <p className="mt-3 text-xs leading-relaxed text-neutral-500">
                Please send <strong>৳{formattedTotal} BDT</strong> to the{" "}
                <strong>{selectedConfig.type || "Personal"}</strong> number
                above via {methodName}, then enter the TrxID below to confirm
                your order.
              </p>

              {/* TrxID Input */}
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Transaction ID (TrxID) *
                </label>
                <Input
                  required
                  type="text"
                  value={form.transactionId}
                  onChange={(e) => {
                    updateField("transactionId", e.target.value.toUpperCase());
                    if (modalError) setModalError("");
                  }}
                  placeholder="e.g. 9J4K2L8M1N"
                  className="h-11 border-neutral-300 bg-white text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:border-neutral-700 dark:bg-[#121212] dark:text-white"
                  autoFocus
                />
                {modalError && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="mt-5 space-y-2">
                <Button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className="h-11 w-full rounded bg-[#f51b25] text-sm font-semibold text-white shadow-md hover:bg-red-600 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing Order...
                    </span>
                  ) : (
                    "Verify & Complete Order"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="w-full py-2 text-center text-xs font-medium text-neutral-500 transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  Cancel / Change details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 flex items-center justify-center dark:bg-[#101010]">
          <Loader2 className="h-8 w-8 animate-spin text-[#f51b25]" />
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
