"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ChevronDown,
  Download,
  ShoppingBag,
  TrendingUp,
  Package,
  Layers,
  Users,
  Clock,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";
import axios from "axios";
import { DashboardOverviewSkeleton } from "@/components/admin/AdminSkeleton";

export default function EcommerceDashboard() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("Today");
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    earnings: { today: 0, total: 0 },
    orders: { today: 0, total: 0, pending: 0, completed: 0 },
    visitors: { today: 0 },
    productsCount: 0,
    categoriesCount: 0,
    chartData: [],
    recentOrders: [],
  });

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        setLoading(true);
        const res = await axios.get(
          `/api/admin/dashboard?timeRange=${encodeURIComponent(timeRange)}`
        );
        if (!ignore && res.data?.success && res.data?.data) {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        if (!ignore) console.error("Failed to fetch dashboard data:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [timeRange]);

  // Export CSV of chart data & summary
  const handleExportCSV = () => {
    if (!dashboardData.chartData || dashboardData.chartData.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["Period/Time", "Unique Visitors", "Page Views", "Orders"];
    const rows = dashboardData.chartData.map((d) => [
      `"${d.time}"`,
      d.visitors || 0,
      d.pageViews || 0,
      d.orders || 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `eflix_analytics_${timeRange.toLowerCase().replace(/\s+/g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val) => {
    return `৳${Number(val || 0).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading && (!dashboardData.chartData || dashboardData.chartData.length === 0)) {
    return <DashboardOverviewSkeleton />;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold mb-1">
            Dashboard Overview
          </h1>
          <p className="text-[#a3a3a3] text-xs sm:text-sm">
            Real-time analytics, revenue, orders, and sales activity.
          </p>
        </div>
      </div>

      {/* Top Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 sm:mb-8">
        {/* Earning Card */}
        <div className="bg-[#353638] border border-[#444444] rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[#a3a3a3] text-xs sm:text-sm font-medium">
              {timeRange} Earning
            </span>
          </div>

          <div className="flex flex-row justify-between items-end gap-4 mt-3">
            <div className="flex items-baseline">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {formatCurrency(dashboardData.earnings?.today)}
              </span>
              <span className="text-[#a3a3a3] text-xs sm:text-sm ml-2">BDT</span>
            </div>

            <button
              onClick={() => router.push("/admin/dashboard/orders/list")}
              className="bg-white text-black text-xs sm:text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-200 transition-colors shrink-0"
            >
              View Orders
            </button>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-[#353638] border border-[#444444] rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[#a3a3a3] text-xs sm:text-sm font-medium">
              {timeRange} Orders
            </span>
          </div>

          <div className="flex items-baseline mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-white">
              {dashboardData.orders?.today ?? 0}
            </span>
            <span className="text-[#a3a3a3] text-xs sm:text-sm ml-2">
              Orders Placed
            </span>
          </div>
        </div>
      </div>

      {/* Controls Bar: Time Range & Export */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        {/* Time Dropdown */}
        <div className="relative w-fit">
          <div className="flex items-center bg-[#353638] rounded-full overflow-hidden border border-[#444444]">
            <span className="px-3.5 py-1.5 text-[#a3a3a3] border-r border-[#444444] text-xs sm:text-sm">
              Time
            </span>

            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="flex items-center px-4 py-1.5 text-xs sm:text-sm hover:bg-[#3d3e40] transition-colors font-medium text-white"
            >
              {timeRange}
              <ChevronDown
                className={`w-4 h-4 ml-1.5 text-[#a3a3a3] transition-transform ${
                  isTimeDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {isTimeDropdownOpen && (
            <div className="absolute top-11 left-0 bg-[#353638] border border-[#444444] rounded-xl shadow-2xl py-2 w-40 z-20">
              {["Today", "Yesterday", "Last 7 Days", "Last 30 Days"].map(
                (option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setTimeRange(option);
                      setIsTimeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs sm:text-sm transition-colors ${
                      timeRange === option
                        ? "bg-[#4469ff] text-white font-medium"
                        : "text-[#e5e5e5] hover:bg-[#404144]"
                    }`}
                  >
                    {option}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          className="bg-white text-black text-xs sm:text-sm font-medium px-5 py-2 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#353638] border border-[#444444] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#a3a3a3] text-xs">
            <span>Period Earning</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mt-3 truncate">
            {formatCurrency(dashboardData.earnings?.today)}
          </div>
        </div>

        <div className="bg-[#353638] border border-[#444444] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#a3a3a3] text-xs">
            <span>Period Orders</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mt-3">
            {dashboardData.orders?.today ?? 0}
          </div>
        </div>

        <div className="bg-[#353638] border border-[#444444] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#a3a3a3] text-xs">
            <span>Active Products</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mt-3">
            {dashboardData.productsCount ?? 0}
          </div>
        </div>

        <div className="bg-[#353638] border border-[#444444] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#a3a3a3] text-xs">
            <span>Categories</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mt-3">
            {dashboardData.categoriesCount ?? 0}
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-[#353638] border border-[#444444] rounded-2xl p-4 sm:p-6 mb-8">
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[#e5e5e5] text-sm sm:text-base font-medium">
              Traffic & Order Distribution
            </span>
            <span className="text-[10px] sm:text-xs bg-[#2f3032] text-[#a3a3a3] px-2.5 py-1 rounded-full border border-[#444444]">
              {timeRange}
            </span>
          </div>
        </div>

        {/* Responsive Chart Container */}
        <div className="w-full h-[280px] sm:h-[340px] lg:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dashboardData.chartData || []}
              margin={{
                top: 10,
                right: 10,
                left: -10,
                bottom: 10,
              }}
            >
              <CartesianGrid
                stroke="#444444"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="time"
                tick={{ fill: "#a3a3a3", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />

              <YAxis
                yAxisId="visitors"
                tick={{ fill: "#a3a3a3", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={45}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value
                }
              />

              <YAxis
                yAxisId="orders"
                orientation="right"
                tick={{ fill: "#a3a3a3", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={35}
              />

              <Tooltip
                cursor={{ stroke: "#666666", strokeDasharray: "4 4" }}
                contentStyle={{
                  backgroundColor: "#292a2c",
                  border: "1px solid #444444",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#a3a3a3", marginBottom: "4px" }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                height={35}
                iconType="line"
                wrapperStyle={{
                  fontSize: "12px",
                  color: "#e5e5e5",
                }}
              />

              <Line
                yAxisId="visitors"
                type="monotone"
                dataKey="visitors"
                name="Visitors"
                stroke="#60a5fa"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2 }}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />

              <Line
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#34d399"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2 }}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Summary Footnote */}
        <div className="mt-4 pt-4 border-t border-[#444444] flex flex-col sm:flex-row sm:justify-between gap-3 text-xs">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <span className="text-[#a3a3a3]">Unique Visitors:</span>
              <span className="text-white font-semibold ml-2">
                {(dashboardData.visitors?.today || 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[#a3a3a3]">Page Views:</span>
              <span className="text-white font-semibold ml-2">
                {(dashboardData.visitors?.pageViews || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[#a3a3a3]">Period Orders:</span>
            <span className="text-white font-semibold ml-2">
              {dashboardData.orders?.today || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}