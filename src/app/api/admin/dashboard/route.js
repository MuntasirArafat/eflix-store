import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Traffic from "@/models/Traffic";

const pad = (n) => String(n).padStart(2, "0");
const formatDateKey = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Count unique visitors across traffic docs. Uses per-browser visitor IDs;
// legacy docs recorded before visitor IDs existed fall back to their IPs.
const countUniqueVisitors = (docs) => {
  const keys = new Set();
  for (const t of docs) {
    if (t.visitorIds && t.visitorIds.length > 0) {
      t.visitorIds.forEach((k) => keys.add(k));
    } else if (t.ips && t.ips.length > 0) {
      t.ips.forEach((ip) => keys.add(`ip:${ip}`));
    }
  }
  return keys.size;
};

const sumPageViews = (docs) =>
  docs.reduce((sum, t) => sum + (t.pageViews || 0), 0);

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "Today";

    const now = new Date();

    let startDate = new Date();
    let endDate = new Date();
    let numDays = 1;
    let isHourly = false;

    if (timeRange === "Today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      isHourly = true;
    } else if (timeRange === "Yesterday") {
      const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      startDate = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0, 0);
      endDate = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999);
      isHourly = true;
    } else if (timeRange === "Last 7 Days") {
      numDays = 7;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      isHourly = false;
    } else if (timeRange === "Last 30 Days") {
      numDays = 30;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      isHourly = false;
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      isHourly = true;
    }

    const startDateKey = formatDateKey(startDate);
    const endDateKey = formatDateKey(endDate);

    const rangeFilter = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    const [
      allOrdersCount,
      pendingOrdersCount,
      completedOrdersCount,
      rangeOrders,
      paidOrdersTotalAgg,
      rangePaidOrdersAgg,
      totalProducts,
      totalCategories,
      recentOrders,
      trafficDocs,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "Pending" }),
      Order.countDocuments({ status: "Delivered" }),
      Order.find(rangeFilter).lean(),
      Order.aggregate([
        { $match: { paymentStatus: "Paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            paymentStatus: "Paid",
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Product.countDocuments(),
      Category.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
      Traffic.find({
        date: { $gte: startDateKey, $lte: endDateKey },
      }).lean(),
    ]);

    const totalEarning = paidOrdersTotalAgg[0]?.total || 0;
    const rangeEarning = rangePaidOrdersAgg[0]?.total || 0;
    const rangeOrdersCount = rangeOrders.length;

    // Generate Chart Data based on time range
    let chartData = [];

    if (isHourly) {
      // 6 buckets of 4 hours: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00
      const buckets = [
        { label: "00:00", start: 0, end: 3 },
        { label: "04:00", start: 4, end: 7 },
        { label: "08:00", start: 8, end: 11 },
        { label: "12:00", start: 12, end: 15 },
        { label: "16:00", start: 16, end: 19 },
        { label: "20:00", start: 20, end: 23 },
      ];

      chartData = buckets.map((bucket) => {
        // Orders in this hour window
        const ordersInBucket = rangeOrders.filter((o) => {
          const oHour = new Date(o.createdAt).getHours();
          return oHour >= bucket.start && oHour <= bucket.end;
        }).length;

        // Traffic docs in this hour window
        const bucketTraffic = trafficDocs.filter(
          (t) => t.hour >= bucket.start && t.hour <= bucket.end
        );

        return {
          time: bucket.label,
          orders: ordersInBucket,
          visitors: countUniqueVisitors(bucketTraffic),
          pageViews: sumPageViews(bucketTraffic),
        };
      });
    } else {
      // Daily aggregation for 7 or 30 days
      chartData = [];

      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - i
        );
        const dStr = formatDateKey(d);
        const dayLabel = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        // Orders on this day
        const dayOrders = rangeOrders.filter((o) => {
          const od = new Date(o.createdAt);
          return (
            od.getFullYear() === d.getFullYear() &&
            od.getMonth() === d.getMonth() &&
            od.getDate() === d.getDate()
          );
        }).length;

        // Traffic docs on this day
        const dayTraffic = trafficDocs.filter((t) => t.date === dStr);

        chartData.push({
          time: dayLabel,
          orders: dayOrders,
          visitors: countUniqueVisitors(dayTraffic),
          pageViews: sumPageViews(dayTraffic),
        });
      }
    }

    // Totals for entire selected range
    const totalRangeVisitors = countUniqueVisitors(trafficDocs);
    const totalRangePageViews = sumPageViews(trafficDocs);

    return NextResponse.json(
      {
        success: true,
        data: {
          timeRange,
          earnings: {
            today: rangeEarning,
            total: totalEarning,
          },
          orders: {
            today: rangeOrdersCount,
            total: allOrdersCount,
            pending: pendingOrdersCount,
            completed: completedOrdersCount,
          },
          visitors: {
            today: totalRangeVisitors,
            pageViews: totalRangePageViews,
          },
          productsCount: totalProducts,
          categoriesCount: totalCategories,
          chartData,
          recentOrders,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET dashboard metrics error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard metrics",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
