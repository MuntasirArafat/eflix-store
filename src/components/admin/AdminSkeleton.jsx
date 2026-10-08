"use client";

/**
 * Shared skeleton loaders for the admin dashboard.
 * Colors match the admin dark theme (#353638 surfaces, #444444 borders).
 */

export function Skeleton({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-[#3d3e41] ${className}`}
    />
  );
}

/** Responsive list skeleton: table rows on desktop, cards on mobile. */
export function TableSkeleton({
  columns = 5,
  rows = 6,
  withAvatar = true,
  minWidth = "w-full",
  className = "mt-4",
}) {
  return (
    <div className={className} aria-busy="true" aria-label="Loading">
      {/* Desktop */}
      <div className="hidden overflow-x-auto rounded-xl border border-[#353638] md:block">
        <table className={`w-full ${minWidth} border-collapse text-left`}>
          <thead>
            <tr className="border-b border-[#353638] bg-[#252628]">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3.5">
                  <Skeleton
                    className={`h-3 ${i === columns - 1 ? "ml-auto w-14" : "w-20"}`}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#353638]">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: columns }).map((_, c) => (
                  <td key={c} className="px-4 py-3.5">
                    {c === 0 ? (
                      <div className="flex items-center gap-3">
                        {withAvatar && (
                          <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />
                        )}
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ) : c === columns - 1 ? (
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    ) : (
                      <Skeleton
                        className={`h-4 ${c % 2 === 0 ? "w-16 rounded-full" : "w-24"}`}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {Array.from({ length: Math.min(rows, 4) }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#444444] bg-[#353638] p-4"
          >
            <div className="flex items-center gap-3">
              {withAvatar && <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton <tr> rows for use inside an existing <tbody>. */
export function TableRowsSkeleton({ columns = 5, rows = 6, withAvatar = false }) {
  return Array.from({ length: rows }).map((_, r) => (
    <tr key={`sk-${r}`} aria-hidden="true">
      {Array.from({ length: columns }).map((_, c) => (
        <td key={c} className="px-4 py-3.5">
          {c === 0 ? (
            <div className="flex items-center gap-3">
              {withAvatar && <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
          ) : c === columns - 1 ? (
            <div className="flex justify-end gap-1">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          ) : (
            <Skeleton
              className={`h-4 ${c % 2 === 0 ? "w-16 rounded-full" : "w-20"}`}
            />
          )}
        </td>
      ))}
    </tr>
  ));
}

/** Stacked mobile list skeleton. */
export function CardListSkeleton({ count = 4, withAvatar = true }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-b border-[#353638] py-4">
          <div className="flex gap-3">
            {withAvatar && <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Grid of simple stat / metric cards. */
export function StatCardsSkeleton({
  count = 4,
  className = "grid grid-cols-2 gap-4 lg:grid-cols-4",
  cardClassName = "rounded-xl border border-[#444444] bg-[#353638] p-4",
}) {
  return (
    <div className={className} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cardClassName}>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-6 w-28" />
        </div>
      ))}
    </div>
  );
}

/** Card with a header and labelled form fields. */
export function FormCardSkeleton({ fields = 4, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-[#444444] bg-[#353638] p-5 sm:p-6 ${className}`}
      aria-busy="true"
      aria-label="Loading"
    >
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-2 h-3 w-64 max-w-full" />
      <div className="mt-6 space-y-5">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full-page skeleton for Admin Dashboard Home/Overview */
export function DashboardOverviewSkeleton() {
  return (
    <div className="w-full" aria-busy="true" aria-label="Loading dashboard">
      {/* Header */}
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

      {/* Top 2 Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 sm:mb-8">
        <div className="bg-[#353638] border border-[#444444] rounded-2xl p-5 sm:p-6">
          <Skeleton className="h-4 w-28 mb-4" />
          <div className="flex justify-between items-end">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
        <div className="bg-[#353638] border border-[#444444] rounded-2xl p-5 sm:p-6">
          <Skeleton className="h-4 w-28 mb-4" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-9 w-32 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#353638] border border-[#444444] rounded-xl p-4">
            <Skeleton className="h-3 w-20 mb-3" />
            <Skeleton className="h-6 w-28" />
          </div>
        ))}
      </div>

      {/* Chart Card */}
      <div className="bg-[#353638] border border-[#444444] rounded-2xl p-4 sm:p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="w-full h-[280px] sm:h-[340px] lg:h-[400px] rounded-xl" />
        <div className="mt-4 pt-4 border-t border-[#444444] flex justify-between">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

/** Full-page skeleton for Product Edit form */
export function ProductEditSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto" aria-busy="true" aria-label="Loading product details">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>

      {/* 2-column form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FormCardSkeleton fields={3} />
          <FormCardSkeleton fields={2} />
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#444444] bg-[#353638] p-5 sm:p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="w-full aspect-square rounded-xl mb-4" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
          <FormCardSkeleton fields={2} />
        </div>
      </div>
    </div>
  );
}



