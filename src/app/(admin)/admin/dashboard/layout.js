"use client";

import {
  LayoutDashboard,
  Package,
  Tags,
  TicketPercent,
  ShoppingCart,
  Bell,
  Settings,
  CircleHelp,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [adminUser, setAdminUser] = useState({ name: "Admin", email: "" });

  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    const fetchLayoutData = async () => {
      try {
        const [dashRes, profileRes] = await Promise.allSettled([
          axios.get("/api/admin/dashboard"),
          axios.get("/api/admin/profile"),
        ]);

        if (isMounted) {
          if (dashRes.status === "fulfilled" && dashRes.value.data?.data?.orders) {
            setPendingOrders(dashRes.value.data.data.orders.pending || 0);
          }
          if (profileRes.status === "fulfilled" && profileRes.value.data?.data) {
            setAdminUser(profileRes.value.data.data);
          }
        }
      } catch (err) {
        console.error("Layout data fetch error:", err);
      }
    };

    fetchLayoutData();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // =========================
  // Active Menu Helper
  // =========================
  const isActive = (href) => {
    // Dashboard should only be active on /dashboard
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    // Other menu items stay active on nested routes
    // Example:
    // /dashboard/products
    // /dashboard/products/new
    // /dashboard/products/edit/123
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // =========================
  // Menu Styles
  // =========================
  const getMenuClass = (href) => {
    const active = isActive(href);

    return `
      flex
      items-center
      gap-3
      rounded-2xl
      px-4
      py-3
      text-sm
      transition
      ${
        active
          ? "bg-[#43454B] text-white"
          : "text-white hover:bg-[#43454B] hover:text-white"
      }
    `;
  };

  const getIconClass = (href) => {
    const active = isActive(href);

    return `
      shrink-0
      ${
        active
          ? "text-white"
          : "text-gray-300"
      }
    `;
  };

  return (
    <div className="min-h-screen bg-[#1B1B1C] text-white">
      {/* =========================
          Mobile Header
      ========================== */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-center border-b border-white/5 bg-[#1B1B1C] px-4 md:hidden">
        {/* Hamburger */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-xl text-white transition hover:bg-[#43454B]"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>

        {/* Center Logo */}
        <Link href="/admin/dashboard/home" onClick={closeSidebar}>
          <Image
            src="/admin.png"
            alt="logo"
            width={110}
            height={50}
            className="h-auto w-[110px] object-contain"
            priority
          />
        </Link>
      </header>

      {/* =========================
          Mobile Overlay
      ========================== */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      {/* =========================
          Sidebar
      ========================== */}
      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          h-screen
          w-64
          bg-[#1B1B1C]
          transform
          transition-transform
          duration-300
          ease-in-out
          md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* =========================
            Logo
        ========================== */}
        <div className="flex h-16 items-center justify-between px-3">
          <Link href="/admin/dashboard/home" onClick={closeSidebar}>
            <Image
              src="/admin.png"
              alt="logo"
              width={170}
              height={150}
              className="h-auto w-[170px]"
              priority
            />
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={closeSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white transition hover:bg-[#43454B] md:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* =========================
            Main Navigation
        ========================== */}
        <nav className="space-y-1 p-4 px-6">
          {/* Dashboard */}
          <Link
            href="/admin/dashboard/home"
            onClick={closeSidebar}
            className={getMenuClass("/admin/dashboard/home")}
          >
            <LayoutDashboard
              size={18}
              className={getIconClass("/admin/dashboard/home")}
            />

            <span>Dashboard</span>
          </Link>

          {/* Products */}
          <Link
            href="/admin/dashboard/products/list"
            onClick={closeSidebar}
            className={getMenuClass("/admin/dashboard/products/list")}
          >
            <Package
              size={18}
              className={getIconClass("/admin/dashboard/products/list")}
            />

            <span>Products</span>
          </Link>

          {/* Categories */}
          <Link
            href="/admin/dashboard/categories"
            onClick={closeSidebar}
            className={getMenuClass("/admin/dashboard/categories")}
          >
            <Tags
              size={18}
              className={getIconClass("/admin/dashboard/categories")}
            />

            <span>Categories</span>
          </Link>

          {/* Coupons */}
          <Link
            href="/admin/dashboard/coupon"
            onClick={closeSidebar}
            className={getMenuClass("/admin/dashboard/coupon")}
          >
            <TicketPercent
              size={18}
              className={getIconClass("/admin/dashboard/coupon")}
            />

            <span>Coupons</span>
          </Link>

          {/* Orders */}
          <Link
            href="/admin/dashboard/orders/list"
            onClick={closeSidebar}
            className={`
              ${getMenuClass("/admin/dashboard/orders/list")}
              justify-between
            `}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart
                size={18}
                className={getIconClass("/admin/dashboard/orders/list")}
              />

              <span>Orders</span>
            </div>

            {pendingOrders > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded bg-white px-1.5 text-[11px] font-medium text-black">
                {pendingOrders > 99 ? "99+" : pendingOrders}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <Link
            href="/admin/dashboard/email"
            onClick={closeSidebar}
            className={getMenuClass("/admin/dashboard/email")}
          >
            <Bell
              size={18}
              className={getIconClass("/admin/dashboard/email")}
            />

            <span>Notifications</span>
          </Link>
        </nav>

        {/* =========================
            Bottom Section
        ========================== */}
        <div className="absolute bottom-0 left-0 w-full p-4 px-6">
          <div className="mb-3 space-y-1">
            {/* Settings */}
            <Link
              href="/admin/dashboard/settings"
              onClick={closeSidebar}
              className={getMenuClass("/admin/dashboard/settings")}
            >
              <Settings
                size={18}
                className={getIconClass("/admin/dashboard/settings")}
              />

              <span>System Settings</span>
            </Link>

            {/* Help */}
            <Link
              href="https://wa.me/8801619573734?text=I+need+help+💁"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeSidebar}
              className={getMenuClass("/admin/settings")}
            >
              <CircleHelp
                size={18}
                className={getIconClass("/admin/settings")}
              />

              <span>Help & Feedback</span>
            </Link>
          </div>

          {/* =========================
              User Profile
          ========================== */}
          <div className="border-t border-white/5 pt-2">
            <Link
              href="/admin/dashboard/profile"
              onClick={closeSidebar}
              className={`
                block
                rounded-2xl
                p-2
                transition
                ${
                  isActive("/admin/dashboard/profile")
                    ? "bg-[#43454B]"
                    : "hover:bg-[#43454B]"
                }
              `}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold uppercase">
                  {adminUser.name?.charAt(0) || "A"}
                </div>

                {/* User Info */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {adminUser.name || "Admin"}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {/* =========================
          Main Content
      ========================== */}
      <div className="min-h-screen bg-[#151517] md:ml-64">
        <main className="mx-auto flex w-full max-w-5xl flex-1 p-4 pt-20 sm:p-6 sm:pt-15 md:pt-8">
          {children}
        </main>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
