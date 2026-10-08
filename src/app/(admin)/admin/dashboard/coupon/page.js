'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TableRowsSkeleton, CardListSkeleton } from '@/components/admin/AdminSkeleton';
import {
  ChevronDown,
  Plus,
  MoreVertical,
  Edit3,
  Trash2,
  X,
  Copy,
  Check,
  Ticket,
  Loader2,
} from 'lucide-react';

const statuses = ['All Status', 'Active', 'Inactive'];

const inputClass =
  'w-full bg-[#353638] border border-[#444444] text-[#e5e5e5] text-sm rounded-full px-4 py-2.5 outline-none focus:border-[#666666] transition-colors';

function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatDiscount(coupon) {
  if (coupon.discountType === 'Percentage') {
    return `${coupon.discount}%`;
  }

  return `৳${Number(coupon.discount).toLocaleString('en-BD')}`;
}

function getStatusStyle(status) {
  if (status === 'Active') {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  }

  return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
}

function getUsagePercentage(coupon) {
  if (!coupon.usageLimit) return 0;

  return Math.min(
    (coupon.used / coupon.usageLimit) * 100,
    100
  );
}

function StatusDropdown({
  value,
  onChange,
  open,
  setOpen,
}) {
  return (
    <div className="relative min-w-0 ">
      <button
        type="button"
        onClick={() => setOpen(open ? null : 'status')}
        className={`${inputClass} flex items-center justify-between gap-3 text-left md:max-w-[220px]`}
      >
        <span className="truncate">{value}</span>

        <ChevronDown
          size={15}
          className={`shrink-0 text-[#a3a3a3] transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close status dropdown"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpen(null)}
          />

          <div className="absolute right-0 top-full z-30 mt-2 w-full min-w-[180px] rounded-xl border border-[#444444] bg-[#353638] p-1.5 shadow-xl">
            {statuses.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  onChange(status);
                  setOpen(null);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  value === status
                    ? 'bg-[#454648] text-white'
                    : 'text-[#c4c4c4] hover:bg-[#404143] hover:text-white'
                }`}
              >
                <span>{status}</span>

                {value === status && (
                  <Check size={15} className="shrink-0" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function CouponManage() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState('All Status');

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] =
    useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [deleteCoupon, setDeleteCoupon] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'Percentage',
    discount: '',
    minimumPurchase: '',
    maximumDiscount: '',
    usageLimit: '',
    expiryDate: '',
    status: 'Active',
  });

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/admin/coupons');
      const list = res.data?.coupons || res.data?.data;
      if (res.data?.success && Array.isArray(list)) {
        setCoupons(list);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setIsLoading(true);
        const res = await axios.get('/api/admin/coupons');
        if (!ignore) {
          const list = res.data?.coupons || res.data?.data;
          if (res.data?.success && Array.isArray(list)) {
            setCoupons(list);
          }
        }
      } catch (err) {
        if (!ignore) console.error('Failed to load coupons:', err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredCoupons = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const matchesSearch =
        !searchValue ||
        (coupon.code && coupon.code.toLowerCase().includes(searchValue)) ||
        (coupon.description && coupon.description.toLowerCase().includes(searchValue));

      const matchesStatus =
        statusFilter === 'All Status' ||
        coupon.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [coupons, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCoupons.length / itemsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * itemsPerPage;

  const paginatedCoupons = filteredCoupons.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('All Status');
    setCurrentPage(1);
  };

  const openAddModal = () => {
    setEditingCoupon(null);

    setFormData({
      code: '',
      description: '',
      discountType: 'Percentage',
      discount: '',
      minimumPurchase: '',
      maximumDiscount: '',
      usageLimit: '',
      expiryDate: '',
      status: 'Active',
    });

    setIsModalOpen(true);
    setIsMenuOpen(null);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);

    let expiryFormatted = '';
    if (coupon.expiryDate) {
      const d = new Date(coupon.expiryDate);
      if (!isNaN(d.getTime())) {
        const pad = (n) => String(n).padStart(2, '0');
        expiryFormatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      }
    }

    setFormData({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'Percentage',
      discount: coupon.discount !== undefined ? coupon.discount : '',
      minimumPurchase: coupon.minimumPurchase !== undefined ? coupon.minimumPurchase : '',
      maximumDiscount: coupon.maximumDiscount !== undefined ? coupon.maximumDiscount : '',
      usageLimit: coupon.usageLimit !== undefined ? coupon.usageLimit : '',
      expiryDate: expiryFormatted,
      status: coupon.status || 'Active',
    });

    setIsModalOpen(true);
    setIsMenuOpen(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const couponData = {
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      discountType: formData.discountType,
      discount: Number(formData.discount),
      minimumPurchase: Number(formData.minimumPurchase),
      maximumDiscount: Number(formData.maximumDiscount) || 0,
      usageLimit: Number(formData.usageLimit),
      expiryDate: formData.expiryDate,
      status: formData.status,
    };

    try {
      if (editingCoupon) {
        const id = editingCoupon._id || editingCoupon.id;
        await axios.put('/api/admin/coupons', { id, ...couponData });
        toast.success('Coupon updated successfully');
      } else {
        await axios.post('/api/admin/coupons', couponData);
        toast.success('Coupon created successfully');
      }

      await fetchCoupons();
      setIsModalOpen(false);
      setEditingCoupon(null);
    } catch (err) {
      console.error('Failed to save coupon:', err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCoupon) return;

    try {
      const id = deleteCoupon._id || deleteCoupon.id;
      await axios.delete(`/api/admin/coupons?id=${id}`);
      toast.success('Coupon deleted successfully');
      await fetchCoupons();
      setDeleteCoupon(null);
      setIsMenuOpen(null);
    } catch (err) {
      console.error('Failed to delete coupon:', err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const copyCoupon = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Coupon code ${code} copied!`);
    } catch {
      toast.error('Failed to copy coupon code');
    }
  };

  const clearAll = () => {
    setSearch('');
    setStatusFilter('All Status');
    setCurrentPage(1);
  };

  return (
    <div className="min-w-0 text-[#e5e5e5] w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Coupons
          </h1>

          <p className="mt-1 text-sm text-[#a3a3a3]">
            Manage discount coupons and promotional offers.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-200 sm:w-auto"
        >
          <Plus size={17} />
          Add Coupon
        </button>
      </div>

      {/* Divider */}
      <div className="my-6 h-px w-full bg-[#353638] sm:my-8" />

      {/* Search + Filter */}
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2 sm:gap-3 md:grid-cols-[minmax(220px,1fr)_minmax(0,220px)]">
        <div className="relative min-w-0">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search coupons..."
            className={inputClass}
          />
        </div>

        <StatusDropdown
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setCurrentPage(1);
          }}
          open={isStatusDropdownOpen}
          setOpen={setIsStatusDropdownOpen}
        />
      </div>

      {/* Results */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-[#a3a3a3]">
          {filteredCoupons.length}{' '}
          {filteredCoupons.length === 1 ? 'coupon' : 'coupons'} found
        </p>

        {(search || statusFilter !== 'All Status') && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-[#a3a3a3] transition-colors hover:text-white"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Desktop Table */}
      <div className="mt-4 hidden md:block">
        <div className="overflow-x-auto rounded-xl border border-[#353638]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#353638] bg-[#252628] text-xs uppercase tracking-wider text-[#888888]">
                <th className="px-4 py-3.5 font-medium">Coupon</th>
                <th className="px-4 py-3.5 font-medium">Discount</th>
                <th className="px-4 py-3.5 font-medium">Min. Purchase</th>
                <th className="px-4 py-3.5 font-medium">Usage</th>
                <th className="px-4 py-3.5 font-medium">Expiry</th>
                <th className="px-4 py-3.5 font-medium">Status</th>
                <th className="px-4 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#353638]">
              {isLoading ? (
                <TableRowsSkeleton columns={7} rows={6} />
              ) : (
                paginatedCoupons.map((coupon) => {
                  const couponId = coupon._id || coupon.id;
                  return (
                    <tr
                      key={couponId}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      {/* Coupon */}
                      <td className="px-4 py-3.5">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-[#e5e5e5]">
                              {coupon.code}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                copyCoupon(coupon.code)
                              }
                              aria-label={`Copy ${coupon.code}`}
                              className="text-[#666666] transition-colors hover:text-white"
                            >
                              <Copy size={14} />
                            </button>
                          </div>

                          <p className="mt-0.5 max-w-[220px] truncate text-xs text-[#888888]">
                            {coupon.description}
                          </p>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-3.5">
                        <div>
                          <span className="text-sm font-medium text-[#e5e5e5]">
                            {formatDiscount(coupon)}
                          </span>

                          <p className="mt-0.5 text-xs text-[#888888]">
                            {coupon.discountType}
                          </p>
                        </div>
                      </td>

                      {/* Minimum */}
                      <td className="px-4 py-3.5 text-sm text-[#b5b5b5]">
                        ৳{Number(coupon.minimumPurchase || 0).toLocaleString('en-BD')}
                      </td>

                      {/* Usage */}
                      <td className="px-4 py-3.5">
                        <div className="w-24">
                          <div className="mb-1.5 flex justify-between text-xs">
                            <span className="text-[#e5e5e5]">
                              {coupon.used || 0}
                            </span>

                            <span className="text-[#777777]">
                              {coupon.usageLimit}
                            </span>
                          </div>

                          <div className="h-1 w-full overflow-hidden rounded-full bg-[#353638]">
                            <div
                              className="h-full rounded-full bg-white transition-all"
                              style={{
                                width: `${getUsagePercentage(
                                  coupon
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Expiry */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#b5b5b5]">
                        {formatDate(coupon.expiryDate)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs ${getStatusStyle(
                            coupon.status
                          )}`}
                        >
                          {coupon.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(coupon)}
                            aria-label={`Edit ${coupon.code}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a3a3a3] transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteCoupon(coupon)}
                            aria-label={`Delete ${coupon.code}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a3a3a3] transition-colors hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {!isLoading && paginatedCoupons.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#353638] text-[#888888]">
                        <Ticket size={24} />
                      </div>

                      <h3 className="mt-4 text-sm font-medium text-[#e5e5e5]">
                        No coupons found
                      </h3>

                      <p className="mt-1 max-w-xs text-sm text-[#888888]">
                        Try changing your search or filters to
                        find what you are looking for.
                      </p>

                      <button
                        type="button"
                        onClick={clearAll}
                        className="mt-4 text-sm text-white underline underline-offset-4"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="mt-4 space-y-3 md:hidden">
        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : (
          paginatedCoupons.map((coupon) => {
            const couponId = coupon._id || coupon.id;
            return (
              <div
                key={couponId}
                className="min-w-0 border-b border-[#353638] py-4"
              >
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#353638] text-[#888888]">
                    <Ticket size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="break-words text-sm font-medium text-[#e5e5e5]">
                            {coupon.code}
                          </h3>

                          <button
                            type="button"
                            onClick={() =>
                              copyCoupon(coupon.code)
                            }
                            aria-label={`Copy ${coupon.code}`}
                            className="shrink-0 text-[#666666] hover:text-white"
                          >
                            <Copy size={14} />
                          </button>
                        </div>

                        <p className="mt-1 break-words text-xs text-[#888888]">
                          {coupon.description}
                        </p>
                      </div>

                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setIsMenuOpen(
                              isMenuOpen === couponId
                                ? null
                                : couponId
                            )
                          }
                          aria-label={`Actions for ${coupon.code}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#a3a3a3]"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {isMenuOpen === couponId && (
                          <>
                            <button
                              type="button"
                              aria-label="Close actions menu"
                              className="fixed inset-0 z-20 cursor-default"
                              onClick={() =>
                                setIsMenuOpen(null)
                              }
                            />

                            <div className="absolute right-0 top-9 z-30 w-32 overflow-hidden rounded-xl border border-[#444444] bg-[#353638] p-1 shadow-xl">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(coupon)
                                }
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-[#e5e5e5] hover:bg-[#404143]"
                              >
                                <Edit3 size={14} />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteCoupon(coupon);
                                  setIsMenuOpen(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatDiscount(coupon)}
                      </span>

                      <span className="text-[#555555]">·</span>

                      <span className="text-xs text-[#a3a3a3]">
                        {coupon.discountType}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${getStatusStyle(
                          coupon.status
                        )}`}
                      >
                        {coupon.status}
                      </span>

                      <span className="text-xs text-[#a3a3a3]">
                        {coupon.used || 0} / {coupon.usageLimit} used
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div>
                        <span className="text-[#666666]">
                          Min. purchase
                        </span>

                        <p className="mt-0.5 text-[#b5b5b5]">
                          ৳
                          {Number(
                            coupon.minimumPurchase
                          ).toLocaleString('en-BD')}
                        </p>
                      </div>

                      <div>
                        <span className="text-[#666666]">
                          Expiry
                        </span>

                        <p className="mt-0.5 text-[#b5b5b5]">
                          {formatDate(coupon.expiryDate)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#353638]">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{
                          width: `${getUsagePercentage(
                            coupon
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {!isLoading && paginatedCoupons.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#353638] text-[#888888]">
              <Ticket size={24} />
            </div>

            <h3 className="mt-4 text-sm font-medium text-[#e5e5e5]">
              No coupons found
            </h3>

            <p className="mt-1 max-w-xs text-sm text-[#888888]">
              Try changing your search or filters to find what
              you are looking for.
            </p>

            <button
              type="button"
              onClick={clearAll}
              className="mt-4 text-sm text-white underline underline-offset-4"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredCoupons.length > 0 && (
        <div className="mt-6 flex flex-col gap-4 border-t border-[#353638] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#888888]">
            Showing {startIndex + 1}–
            {Math.min(
              startIndex + itemsPerPage,
              filteredCoupons.length
            )}{' '}
            of {filteredCoupons.length} coupons
          </p>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(1, page - 1)
                )
              }
              className="inline-flex items-center rounded-full border border-[#444444] px-3 py-2 text-sm text-[#c4c4c4] transition-colors hover:bg-[#353638] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="px-2 text-sm text-[#a3a3a3]">
              {safePage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(totalPages, page + 1)
                )
              }
              className="inline-flex items-center rounded-full border border-[#444444] px-3 py-2 text-sm text-[#c4c4c4] transition-colors hover:bg-[#353638] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="coupon-modal-title"
            className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-[#444444] bg-[#252628] sm:max-w-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 border-b border-[#444444] px-5 py-5 sm:px-6">
              <div>
                <h2
                  id="coupon-modal-title"
                  className="text-lg font-semibold text-[#e5e5e5]"
                >
                  {editingCoupon
                    ? 'Edit Coupon'
                    : 'Add Coupon'}
                </h2>

                <p className="mt-1 text-sm text-[#888888]">
                  {editingCoupon
                    ? 'Update coupon information.'
                    : 'Create a new discount coupon.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#a3a3a3] transition-colors hover:bg-[#353638] hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Code */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm text-[#e5e5e5]">
                    Coupon Code
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value
                          .toUpperCase()
                          .replace(/\s/g, ''),
                      })
                    }
                    placeholder="e.g. SAVE20"
                    className="h-11 w-full rounded-xl border border-[#444444] bg-[#2f3032] px-4 text-sm text-white outline-none placeholder:text-[#666666] focus:border-[#666666]"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm text-[#e5e5e5]">
                    Description
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter coupon description"
                    className="h-11 w-full rounded-xl border border-[#444444] bg-[#2f3032] px-4 text-sm text-white outline-none placeholder:text-[#666666] focus:border-[#666666]"
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="mb-2 block text-sm text-[#e5e5e5]">
                    Discount Type
                  </label>

                  <div className="relative">
                    <select
                      value={formData.discountType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountType: e.target.value,
                        })
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-[#444444] bg-[#2f3032] px-4 pr-10 text-sm text-white outline-none focus:border-[#666666]"
                    >
                      <option value="Percentage">
                        Percentage
                      </option>
                      <option value="Fixed">
                        Fixed Amount
                      </option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777777]" />
                  </div>
                </div>

                {/* Discount */}
                <div>
                  <label className="mb-2 block text-sm text-[#e5e5e5]">
                    Discount
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      max={
                        formData.discountType ===
                        'Percentage'
                          ? 100
                          : undefined
                      }
                      value={formData.discount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount: e.target.value,
                        })
                      }
                      placeholder={
                        formData.discountType ===
                        'Percentage'
                          ? '10'
                          : '100'
                      }
                      className="h-11 w-full rounded-xl border border-[#444444] bg-[#2f3032] px-4 pr-10 text-sm text-white outline-none placeholder:text-[#666666] focus:border-[#666666]"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#777777]">
                      {formData.discountType ===
                      'Percentage'
                        ? '%'
                        : '৳'}
                    </span>
                  </div>
                </div>

                {/* Minimum Purchase */}
                <div>
                  <label className="mb-2 block text-sm text-[#e5e5e5]">
                    Minimum Purchase
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#777777]">
                      ৳
                    </span>

                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.minimumPurchase}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minimumPurchase: e.target.value,
                        })
                      }
                      placeholder="500"
                      className="h-11 w-full rounded-xl border border-[#444444] bg-[#2f3032] pl-9 pr-4 text-sm text-white outline-none placeholder:text-[#666666] focus:border-[#666666]"
                    />
                  </div>
                </div>

                {/* Maximum Discount */}
                <div>
                  <label className="mb-2 block text-sm text-[#e5e5e5]">
                    Maximum Discount
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#777777]">
                      ৳
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={formData.maximumDiscount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maximumDiscount: e.target.value,
                        })
                      }
                      placeholder="100"
                      className="h-11 w-full rounded-xl border border-[#444444] bg-[#2f3032] pl-9 pr-4 text-sm text-white outline-none placeholder:text-[#666666] focus:border-[#666666]"
                    />
                  </div>
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="mb-2 block text-sm text-[#e5e5e5]">
                    Usage Limit
                  </label>

                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usageLimit: e.target.value,
                      })
                    }
                    placeholder="100"
                    className="h-11 w-full rounded-xl border border-[#444444] bg-[#2f3032] px-4 text-sm text-white outline-none placeholder:text-[#666666] focus:border-[#666666]"
                  />
                </div>

                {/* Expiry */}
                <div>
                  <label className="mb-2 block text-sm text-[#e5e5e5]">
                    Expiry Date
                  </label>

                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expiryDate: e.target.value,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-[#444444] bg-[#2f3032] px-4 text-sm text-white outline-none focus:border-[#666666]"
                  />
                </div>

                {/* Status */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm text-[#e5e5e5]">
                    Status
                  </label>

                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value,
                        })
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-[#444444] bg-[#2f3032] px-4 pr-10 text-sm text-white outline-none focus:border-[#666666]"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777777]" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#444444] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-[#444444] px-5 py-2.5 text-sm font-medium text-[#e5e5e5] transition-colors hover:bg-[#353638]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-200 disabled:opacity-50"
                >
                  {isSaving
                    ? 'Saving...'
                    : editingCoupon
                    ? 'Update Coupon'
                    : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCoupon && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setDeleteCoupon(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-coupon-title"
            className="w-full max-w-sm rounded-2xl border border-[#444444] bg-[#252628] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <Trash2 size={20} />
            </div>

            <h2
              id="delete-coupon-title"
              className="mt-4 text-lg font-semibold text-[#e5e5e5]"
            >
              Delete coupon?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#a3a3a3]">
              Are you sure you want to delete{' '}
              <span className="font-medium text-[#e5e5e5]">
                {deleteCoupon.code}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteCoupon(null)}
                className="flex-1 rounded-full border border-[#444444] px-4 py-2.5 text-sm text-[#e5e5e5] transition-colors hover:bg-[#353638]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 rounded-full bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

