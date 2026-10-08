"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import axios from "axios";
import { Clock3, Mail, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { useLanguage } from "@/context/LanguageContext";

function OrderConfirmationPage({ params }) {
  const unwrappedParams = use(params);
  const orderIdParam = unwrappedParams.id;
  const { t } = useLanguage();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Confetti effect on load
  useEffect(() => {
    const timer = setTimeout(() => {
      const colors = [
        "#f51b25",
        "#facc15",
        "#22c55e",
        "#3b82f6",
        "#a855f7",
        "#ec4899",
      ];

      confetti({
        particleCount: 70,
        angle: 60,
        spread: 65,
        startVelocity: 40,
        gravity: 1,
        ticks: 160,
        origin: { x: 0, y: 0.65 },
        colors,
      });

      confetti({
        particleCount: 70,
        angle: 120,
        spread: 65,
        startVelocity: 40,
        gravity: 1,
        ticks: 160,
        origin: { x: 1, y: 0.65 },
        colors,
      });

      setTimeout(() => {
        confetti({
          particleCount: 35,
          angle: 70,
          spread: 55,
          startVelocity: 32,
          gravity: 1.1,
          ticks: 130,
          origin: { x: 0, y: 0.55 },
          colors,
        });

        confetti({
          particleCount: 35,
          angle: 110,
          spread: 55,
          startVelocity: 32,
          gravity: 1.1,
          ticks: 130,
          origin: { x: 1, y: 0.55 },
          colors,
        });
      }, 300);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  // Fetch real order from backend
  useEffect(() => {
    async function loadOrder() {
      try {
        setIsLoading(true);
        const res = await axios.get(`/api/orders/${orderIdParam}`);
        if (res.data?.success && res.data?.data) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load order confirmation:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (orderIdParam) {
      loadOrder();
    }
  }, [orderIdParam]);

  const displayOrderId = order?.orderNumber || orderIdParam || "ORD-PENDING";
  const displayTotal = order?.total
    ? Number(order.total).toLocaleString("en-BD")
    : "0";
  const displayEmail = order?.email || "your email address";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8 text-neutral-900 transition-colors dark:bg-[#101010] dark:text-white">
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#181818] sm:p-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="flex h-20 w-30 items-center justify-center rounded-full">
              <img src="/verified.webp" alt="Order verified" />
            </div>
          </div>

          {/* Thank You */}
          <div className="mt-5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("thank_you_title")}
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500 dark:text-neutral-400">
              {t("order_placed_desc")}
            </p>
          </div>

          {/* SKELETON OR REAL ORDER ID */}
          <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-[#111111]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                  {t("order_id_label")}
                </p>

                {isLoading ? (
                  <div className="mt-1 h-5 w-32 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                ) : (
                  <p className="mt-1 text-sm font-semibold tracking-wide">
                    {displayOrderId}
                  </p>
                )}
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white dark:bg-[#181818]">
                <ShoppingBag className="h-4 w-4 text-neutral-500" />
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-[#111111]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">{t("total_amount")}</span>

              {isLoading ? (
                <div className="h-5 w-20 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              ) : (
                <span className="font-semibold">৳{displayTotal} BDT</span>
              )}
            </div>

            <div className="my-3 h-px bg-neutral-200 dark:bg-neutral-800" />

            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />

              <div>
                <p className="text-xs font-medium">{t("confirmation_email_title")}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {t("confirmation_email_desc")}{" "}
                  <strong className="text-neutral-700 dark:text-neutral-300">
                    {displayEmail}
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Processing Notice */}
          <div className="mt-4 flex gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-[#111111]">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />

            <div>
              <p className="text-xs font-medium">{t("order_reviewing_title")}</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                {t("order_reviewing_desc")}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-2.5">
            <Link href="/" className="block">
              <Button className="h-11 w-full rounded-lg bg-[#f51b25] text-sm font-semibold text-white hover:bg-red-600">
                {t("continue_shopping")}
              </Button>
            </Link>

            <Link href="/filter" className="block">
              <Button variant="outline" className="h-11 w-full rounded-lg text-sm">
                {t("browse_more_products")}
              </Button>
            </Link>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-[10px] leading-4 text-neutral-500">
            {t("order_support_note")}
          </p>
        </div>
      </div>
    </main>
  );
}

export default OrderConfirmationPage;