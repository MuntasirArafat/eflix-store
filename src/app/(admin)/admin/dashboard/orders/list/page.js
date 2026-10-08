'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TableSkeleton } from '@/components/admin/AdminSkeleton';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  Package,
  Check,
  Clock3,
  Truck,
  Loader2,
} from 'lucide-react';


const statuses = [
  'All Status',
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const paymentStatuses = [
  'All Payments',
  'Paid',
  'Pending',
  'Failed',
  'Refunded',
];

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Total: Low to High', value: 'total-asc' },
  { label: 'Total: High to Low', value: 'total-desc' },
  { label: 'Customer: A to Z', value: 'customer-asc' },
];

const inputClass =
  'w-full bg-[#353638] border border-[#444444] text-[#e5e5e5] text-sm rounded-full px-4 py-2.5 outline-none focus:border-[#666666] transition-colors';

function formatPrice(price) {
  return `৳${Number(price).toLocaleString('en-BD')}`;
}

function formatDate(date) {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}


function getOrderStatusStyle(status) {
  switch (status) {
    case 'Delivered':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Processing':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'Shipped':
      return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    case 'Pending':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'Cancelled':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
}

function getPaymentStatusStyle(status) {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Pending':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'Failed':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'Refunded':
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
}

function StatusBadge({ status, payment = false }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs ${
        payment
          ? getPaymentStatusStyle(status)
          : getOrderStatusStyle(status)
      }`}
    >
      {status}
    </span>
  );
}

function Dropdown({
  value,
  options,
  onChange,
  openDropdown,
  setOpenDropdown,
  dropdownId,
}) {
  const isOpen = openDropdown === dropdownId;

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpenDropdown(isOpen ? null : dropdownId)}
        className={`${inputClass} flex items-center justify-between gap-3 text-left`}
      >
        <span className="truncate">{value}</span>

        <ChevronDown
          size={15}
          className={`shrink-0 text-[#a3a3a3] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close dropdown"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpenDropdown(null)}
          />

          <div className="absolute left-0 top-full z-30 mt-2 max-h-64 w-full min-w-[180px] overflow-y-auto rounded-xl border border-[#444444] bg-[#353638] p-1.5 shadow-xl">
            {options.map((option) => {
              const optionValue =
                typeof option === 'string' ? option : option.value;

              const optionLabel =
                typeof option === 'string' ? option : option.label;

              return (
                <button
                  key={optionValue}
                  type="button"
                  onClick={() => {
                    onChange(optionValue);
                    setOpenDropdown(null);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    value === optionValue
                      ? 'bg-[#454648] text-white'
                      : 'text-[#c4c4c4] hover:bg-[#404143] hover:text-white'
                  }`}
                >
                  <span>{optionLabel}</span>

                  {value === optionValue && (
                    <Check size={15} className="shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function OrderSelect({
  label,
  value,
  options,
  onChange,
  open,
  onToggle,
  onClose,
}) {
  return (
    <div className="relative w-full">
      <label className="mb-2 block text-sm text-[#a3a3a3]">
        {label}
      </label>

      <button
        type="button"
        onClick={onToggle}
        className={`${inputClass} flex items-center justify-between gap-3 rounded-xl text-left`}
      >
        <span className="truncate">{value}</span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-[#a3a3a3] transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[80] mt-2 max-h-52 overflow-y-auto rounded-xl border border-[#444444] bg-[#353638] p-1.5 shadow-xl">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                onClose();
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors ${
                value === option
                  ? 'bg-[#454648] text-white'
                  : 'text-[#c4c4c4] hover:bg-[#404143]'
              }`}
            >
              <span>{option}</span>

              {value === option && (
                <Check size={16} className="shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrderListPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [paymentFilter, setPaymentFilter] = useState('All Payments');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [deleteOrder, setDeleteOrder] = useState(null);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState('All Status');
  const [draftPayment, setDraftPayment] = useState('All Payments');
  const [draftSortBy, setDraftSortBy] = useState('Newest First');
  const [mobileSelectOpen, setMobileSelectOpen] = useState(null);

  const [statusOrder, setStatusOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/orders');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const response = await axios.get('/api/admin/orders');
        if (!ignore && response.data?.success) {
          setOrders(response.data.data);
        }
      } catch (error) {
        console.error('Fetch orders error:', error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, []);


  const pageSize = 8;

  const sortLabel =
    sortOptions.find((option) => option.value === sortBy)?.label ||
    'Newest First';

  const activeFilterCount = [
    statusFilter !== 'All Status',
    paymentFilter !== 'All Payments',
    sortBy !== 'newest',
  ].filter(Boolean).length;

  const openMobileFilters = () => {
    setDraftStatus(statusFilter);
    setDraftPayment(paymentFilter);
    setDraftSortBy(sortLabel);
    setMobileSelectOpen(null);
    setIsFilterModalOpen(true);
  };

  const applyMobileFilters = () => {
    setStatusFilter(draftStatus);
    setPaymentFilter(draftPayment);

    setSortBy(
      sortOptions.find((option) => option.label === draftSortBy)?.value ||
        'newest'
    );

    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  const resetMobileFilters = () => {
    setDraftStatus('All Status');
    setDraftPayment('All Payments');
    setDraftSortBy('Newest First');
    setMobileSelectOpen(null);
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.orderNumber.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'All Status' ||
        order.status === statusFilter;

      const matchesPayment =
        paymentFilter === 'All Payments' ||
        order.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.date) - new Date(b.date);

        case 'total-asc':
          return a.total - b.total;

        case 'total-desc':
          return b.total - a.total;

        case 'customer-asc':
          return a.customer.localeCompare(b.customer);

        case 'newest':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
  }, [orders, search, statusFilter, paymentFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedOrders = filteredOrders.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const totalRevenue = orders
    .filter(
      (order) =>
        order.paymentStatus === 'Paid' &&
        order.status !== 'Cancelled'
    )
    .reduce((sum, order) => sum + order.total, 0);

  const pendingCount = orders.filter(
    (order) => order.status === 'Pending'
  ).length;

  const processingCount = orders.filter(
    (order) => order.status === 'Processing'
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === 'Delivered'
  ).length;

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('All Status');
    setPaymentFilter('All Payments');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const confirmDelete = async () => {
    if (!deleteOrder) return;

    try {
      const id = deleteOrder._id || deleteOrder.id;
      await axios.delete(`/api/admin/orders?id=${id}`);
      setOrders((current) =>
        current.filter((order) => (order._id || order.id) !== id)
      );
      toast.success('Order deleted successfully');
    } catch (error) {
      console.error('Delete order error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete order.');
    } finally {
      setDeleteOrder(null);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put('/api/admin/orders', { id, status });
      setOrders((current) =>
        current.map((order) =>
          (order._id || order.id) === id ? { ...order, status } : order
        )
      );
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Update status error:', error);
      toast.error(error.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusOrder(null);
    }
  };


  return (
    <div className="min-w-0 text-[#e5e5e5] w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Orders
          </h1>

          <p className="mt-1 text-sm text-[#a3a3a3]">
            Manage customer orders, payments and deliveries.
          </p>
        </div>
      </div>

      <div className="my-6 h-px w-full bg-[#353638] sm:my-8" />

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="min-w-0 rounded-2xl border border-[#353638] bg-[#252628] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#a3a3a3] sm:text-sm">
              Total Orders
            </span>
          </div>

          <p className="mt-3 text-xl font-semibold sm:text-2xl">
            {orders.length}
          </p>

          <p className="mt-1 text-xs text-[#888888]">
            All orders
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-[#353638] bg-[#252628] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#a3a3a3] sm:text-sm">
              Paid Revenue
            </span>
          </div>

          <p className="mt-3 break-words text-xl font-semibold sm:text-2xl">
            {formatPrice(totalRevenue)}
          </p>

          <p className="mt-1 text-xs text-[#888888]">
            Net of cancelled orders
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-[#353638] bg-[#252628] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#a3a3a3] sm:text-sm">
              Processing
            </span>
          </div>

          <p className="mt-3 text-xl font-semibold sm:text-2xl">
            {processingCount}
          </p>

          <p className="mt-1 text-xs text-[#888888]">
            {pendingCount} awaiting confirmation
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-[#353638] bg-[#252628] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#a3a3a3] sm:text-sm">
              Delivered
            </span>
          </div>

          <p className="mt-3 text-xl font-semibold sm:text-2xl">
            {deliveredCount}
          </p>

          <p className="mt-1 text-xs text-[#888888]">
            Successfully completed
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2 sm:gap-3 md:grid-cols-[minmax(220px,1fr)_minmax(0,220px)_minmax(0,220px)]">
        <div className="relative min-w-0">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888] sm:left-4"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search orders or customers..."
            aria-label="Search orders or customers"
            className={`${inputClass} pl-10 sm:pl-11`}
          />
        </div>

        <div className="hidden min-w-0 md:block">
          <Dropdown
            value={statusFilter}
            options={statuses}
            onChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            dropdownId="order-status"
          />
        </div>

        <div className="hidden min-w-0 md:block">
          <Dropdown
            value={paymentFilter}
            options={paymentStatuses}
            onChange={(value) => {
              setPaymentFilter(value);
              setCurrentPage(1);
            }}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            dropdownId="payment-status"
          />
        </div>

        <button
          type="button"
          onClick={openMobileFilters}
          className="relative inline-flex min-w-[88px] items-center justify-center gap-2 rounded-full border border-[#444444] bg-[#353638] px-3 py-2.5 text-sm text-[#e5e5e5] transition-colors hover:bg-[#404143] md:hidden"
        >
          <SlidersHorizontal size={16} />

          <span>Filters</span>

          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-semibold text-black">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Results count */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-[#a3a3a3]">
          {filteredOrders.length}{' '}
          {filteredOrders.length === 1 ? 'order' : 'orders'} found
        </p>

        {(search ||
          statusFilter !== 'All Status' ||
          paymentFilter !== 'All Payments' ||
          sortBy !== 'newest') && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-[#a3a3a3] transition-colors hover:text-white"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <TableSkeleton columns={5} rows={8} withAvatar={false} minWidth="w-full" />
      ) : (
        <>
          {/* Desktop orders table */}
          <div className="mt-4 hidden md:block">
            <div className="overflow-x-auto rounded-xl border border-[#353638]">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#353638] bg-[#252628] text-xs uppercase tracking-wider text-[#888888]">
                    <th className="px-4 py-3.5 font-medium">Order</th>
                    <th className="px-4 py-3.5 font-medium">Date</th>
                    <th className="px-4 py-3.5 font-medium">Payment</th>
                    <th className="px-4 py-3.5 font-medium">Status</th>
                    <th className="px-4 py-3.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#353638]">
                  {paginatedOrders.map((order) => {
                    const orderKey = order._id || order.id || order.orderNumber;
                    return (
                      <tr
                        key={orderKey}
                        className="transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-medium text-[#e5e5e5]">
                            {order.orderNumber}
                          </p>
                          <p className="mt-0.5 text-xs text-[#888888]">
                            {order.items} {order.items === 1 ? 'item' : 'items'}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#b5b5b5]">
                          {formatDate(order.createdAt || order.date)}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-medium text-[#e5e5e5]">
                              {order.paymentMethod || 'Manual'}
                            </span>
                            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[11px] text-[#a3a3a3] border border-white/10">
                              {order.paymentStatus}
                            </span>
                          </div>
                          {order.transactionId && (
                            <p
                              className="mt-1 font-mono text-xs text-[#888888] truncate max-w-[200px]"
                              title={order.transactionId}
                            >
                              {order.transactionId}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <StatusBadge status={order.status} />
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(`/admin/dashboard/orders/${orderKey}`)
                              }
                              aria-label={`View ${order.orderNumber}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a3a3a3] transition-colors hover:bg-white/10 hover:text-white"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteOrder(order)}
                              aria-label={`Delete ${order.orderNumber}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a3a3a3] transition-colors hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {paginatedOrders.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#353638] text-[#888888]">
                            <Package size={24} />
                          </div>

                          <h3 className="mt-4 text-sm font-medium text-[#e5e5e5]">
                            No orders found
                          </h3>

                          <p className="mt-1 max-w-xs text-sm text-[#888888]">
                            Try changing your search or filters to find what you are looking for.
                          </p>

                          <button
                            type="button"
                            onClick={clearFilters}
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

          {/* Mobile orders list */}
          <div className="mt-4 space-y-3 md:hidden">
            {paginatedOrders.map((order) => {
              const orderKey = order._id || order.id || order.orderNumber;
              return (
                <div
                  key={orderKey}
                  className="min-w-0 border-b border-[#353638] py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#353638] text-[#a3a3a3]">
                        <Package size={20} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-all text-sm font-medium text-[#e5e5e5]">
                          {order.orderNumber}
                        </h3>

                        <p className="mt-1 truncate text-sm text-[#b5b5b5]">
                          {order.customer}
                        </p>

                        <p className="mt-1 text-xs text-[#888888]">
                          {formatDate(order.createdAt || order.date)} · {order.items}{' '}
                          {order.items === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-semibold">
                      {formatPrice(order.total)}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusBadge status={order.status} />
                    <StatusBadge status={order.paymentStatus} payment />
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/admin/dashboard/orders/${orderKey}`)
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#444444] px-3 py-1.5 text-xs text-[#d4d4d4] transition-colors hover:bg-[#353638]"
                    >
                      <Eye size={13} />
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteOrder(order)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#444444] px-3 py-1.5 text-xs text-[#d4d4d4] transition-colors hover:border-red-500/40 hover:text-red-400"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}

            {paginatedOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#353638] text-[#888888]">
                  <Package size={24} />
                </div>

                <h3 className="mt-4 text-sm font-medium text-[#e5e5e5]">
                  No orders found
                </h3>

                <p className="mt-1 max-w-xs text-sm text-[#888888]">
                  Try changing your search or filters to find what you are looking for.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-sm text-white underline underline-offset-4"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="mt-6 flex flex-col gap-4 border-t border-[#353638] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#888888]">
            Showing {(safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, filteredOrders.length)} of{' '}
            {filteredOrders.length} orders
          </p>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
              className="inline-flex items-center gap-1 rounded-full border border-[#444444] px-3 py-2 text-sm text-[#c4c4c4] transition-colors hover:bg-[#353638] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
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
              className="inline-flex items-center gap-1 rounded-full border border-[#444444] px-3 py-2 text-sm text-[#c4c4c4] transition-colors hover:bg-[#353638] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile filter modal */}
      {isFilterModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
          onClick={() => setIsFilterModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            className="relative max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border border-[#444444] bg-[#252628] p-5 pb-[max(20px,env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2
                  id="mobile-filter-title"
                  className="text-lg font-semibold text-[#e5e5e5]"
                >
                  Filters
                </h2>

                <p className="mt-1 text-sm text-[#888888]">
                  Refine your order list.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#a3a3a3] transition-colors hover:bg-[#353638] hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <OrderSelect
                label="Order Status"
                value={draftStatus}
                options={statuses}
                onChange={setDraftStatus}
                open={mobileSelectOpen === 'status'}
                onToggle={() =>
                  setMobileSelectOpen((value) =>
                    value === 'status' ? null : 'status'
                  )
                }
                onClose={() => setMobileSelectOpen(null)}
              />

              <OrderSelect
                label="Payment Status"
                value={draftPayment}
                options={paymentStatuses}
                onChange={setDraftPayment}
                open={mobileSelectOpen === 'payment'}
                onToggle={() =>
                  setMobileSelectOpen((value) =>
                    value === 'payment' ? null : 'payment'
                  )
                }
                onClose={() => setMobileSelectOpen(null)}
              />

              <OrderSelect
                label="Sort By"
                value={draftSortBy}
                options={sortOptions.map((option) => option.label)}
                onChange={setDraftSortBy}
                open={mobileSelectOpen === 'sort'}
                onToggle={() =>
                  setMobileSelectOpen((value) =>
                    value === 'sort' ? null : 'sort'
                  )
                }
                onClose={() => setMobileSelectOpen(null)}
              />
            </div>

            <div className="mt-7 flex items-center gap-3 border-t border-[#444444] pt-5">
              <button
                type="button"
                onClick={resetMobileFilters}
                className="flex-1 rounded-full border border-[#444444] px-4 py-3 text-sm font-medium text-[#e5e5e5] transition-colors hover:bg-[#353638]"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={applyMobileFilters}
                className="flex-1 rounded-full bg-white px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-gray-200"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteOrder && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setDeleteOrder(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-order-title"
            className="w-full max-w-sm rounded-2xl border border-[#444444] bg-[#252628] p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <Trash2 size={20} />
            </div>

            <h2
              id="delete-order-title"
              className="mt-4 text-lg font-semibold"
            >
              Delete order?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#a3a3a3]">
              Are you sure you want to delete{' '}
              <span className="font-medium text-[#e5e5e5]">
                {deleteOrder.orderNumber}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteOrder(null)}
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

      {/* Optional order status update modal */}
      {statusOrder && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setStatusOrder(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="update-order-title"
            className="w-full max-w-sm rounded-2xl border border-[#444444] bg-[#252628] p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#353638] text-[#e5e5e5]">
              <Truck size={20} />
            </div>

            <h2
              id="update-order-title"
              className="mt-4 text-lg font-semibold"
            >
              Update order status
            </h2>

            <p className="mt-2 text-sm text-[#a3a3a3]">
              Choose a new status for {statusOrder.orderNumber}.
            </p>

            <div className="mt-5 space-y-2">
              {statuses.slice(1).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    updateOrderStatus(statusOrder.id, status)
                  }
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-sm transition-colors ${
                    statusOrder.status === status
                      ? 'border-[#666666] bg-[#353638] text-white'
                      : 'border-[#444444] text-[#c4c4c4] hover:bg-[#353638]'
                  }`}
                >
                  <StatusBadge status={status} />

                  {statusOrder.status === status && (
                    <Check size={16} />
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStatusOrder(null)}
              className="mt-5 w-full rounded-full border border-[#444444] px-4 py-2.5 text-sm text-[#e5e5e5] transition-colors hover:bg-[#353638]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

