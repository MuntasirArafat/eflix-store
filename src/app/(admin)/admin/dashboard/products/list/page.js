'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TableSkeleton } from '@/components/admin/AdminSkeleton';
import {
  Plus,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Star,
  Package,
  Image as ImageIcon,
  Check,
  Loader2,
} from 'lucide-react';

const initialProducts = [
  {
    id: 1,
    name: 'Wireless Headphones',
    slug: 'wireless-headphones',
    sku: 'WH-001',
    category: 'Electronics',
    price: 2499,
    stock: 24,
    status: 'Active',
    featured: true,
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160&h=160&fit=crop',
    createdAt: '2026-09-20',
  },
  {
    id: 2,
    name: 'Classic Cotton T-Shirt',
    slug: 'classic-cotton-t-shirt',
    sku: 'TS-002',
    category: 'Fashion',
    price: 850,
    stock: 8,
    status: 'Active',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=160&h=160&fit=crop',
    createdAt: '2026-09-18',
  },
  {
    id: 3,
    name: 'Minimal Desk Lamp',
    slug: 'minimal-desk-lamp',
    sku: 'DL-003',
    category: 'Home & Living',
    price: 1650,
    stock: 0,
    status: 'Out of Stock',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=160&h=160&fit=crop',
    createdAt: '2026-09-15',
  },
  {
    id: 4,
    name: 'Daily Face Moisturizer',
    slug: 'daily-face-moisturizer',
    sku: 'FM-004',
    category: 'Beauty',
    price: 1200,
    stock: 42,
    status: 'Active',
    featured: true,
    image:
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=160&h=160&fit=crop',
    createdAt: '2026-09-12',
  },
  {
    id: 5,
    name: 'Everyday Running Shoes',
    slug: 'everyday-running-shoes',
    sku: 'RS-005',
    category: 'Sports',
    price: 3200,
    stock: 15,
    status: 'Draft',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&h=160&fit=crop',
    createdAt: '2026-09-10',
  },
  {
    id: 6,
    name: 'Modern Ceramic Mug',
    slug: 'modern-ceramic-mug',
    sku: 'CM-006',
    category: 'Home & Living',
    price: 450,
    stock: 5,
    status: 'Active',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=160&h=160&fit=crop',
    createdAt: '2026-09-08',
  },
  {
    id: 7,
    name: 'Travel Backpack',
    slug: 'travel-backpack',
    sku: 'TB-007',
    category: 'Fashion',
    price: 2800,
    stock: 19,
    status: 'Archived',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=160&h=160&fit=crop',
    createdAt: '2026-09-05',
  },
  {
    id: 8,
    name: 'Design Inspiration Book',
    slug: 'design-inspiration-book',
    sku: 'BK-008',
    category: 'Books',
    price: 990,
    stock: 12,
    status: 'Active',
    featured: true,
    image:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=160&h=160&fit=crop',
    createdAt: '2026-09-01',
  },
  {
    id: 9,
    name: 'Smart Watch',
    slug: 'smart-watch',
    sku: 'SW-009',
    category: 'Electronics',
    price: 4500,
    stock: 0,
    status: 'Out of Stock',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&h=160&fit=crop',
    createdAt: '2026-08-28',
  },
  {
    id: 10,
    name: 'Leather Wallet',
    slug: 'leather-wallet',
    sku: 'LW-010',
    category: 'Fashion',
    price: 1350,
    stock: 31,
    status: 'Active',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=160&h=160&fit=crop',
    createdAt: '2026-08-25',
  },
  {
    id: 11,
    name: 'Scented Candle',
    slug: 'scented-candle',
    sku: 'SC-011',
    category: 'Home & Living',
    price: 650,
    stock: 17,
    status: 'Draft',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=160&h=160&fit=crop',
    createdAt: '2026-08-22',
  },
  {
    id: 12,
    name: 'Sunscreen SPF 50',
    slug: 'sunscreen-spf-50',
    sku: 'SS-012',
    category: 'Beauty',
    price: 780,
    stock: 28,
    status: 'Active',
    featured: true,
    image:
      'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=160&h=160&fit=crop',
    createdAt: '2026-08-20',
  },
];

const categories = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Home & Living',
  'Beauty',
  'Sports',
  'Books',
];

const statuses = [
  'All Status',
  'Active',
  'Draft',
  'Out of Stock',
  'Archived',
];

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Name: A to Z', value: 'name-asc' },
  { label: 'Name: Z to A', value: 'name-desc' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Stock: Low to High', value: 'stock-asc' },
  { label: 'Stock: High to Low', value: 'stock-desc' },
];

const inputClass =
  'w-full bg-[#353638] border border-[#444444] text-[#e5e5e5] text-sm rounded-full px-4 py-2.5 outline-none focus:border-[#666666] transition-colors';

function formatPrice(price) {
  return `৳${Number(price).toLocaleString('en-BD')}`;
}

function getStatusStyle(status) {
  switch (status) {
    case 'Active':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Draft':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'Out of Stock':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'Archived':
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
}

function Dropdown({
  label,
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
        <span className="truncate">{label || value}</span>
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

function ProductImage({ src, name }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!src || imageFailed) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#353638] text-[#777777]">
        <ImageIcon size={19} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="h-12 w-12 shrink-0 rounded-lg border border-[#444444] object-cover"
      onError={() => setImageFailed(true)}
    />
  );
}

export default function ProductListPage() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesList, setCategoriesList] = useState(["All Categories"]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);

  // Mobile filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState('All Categories');
  const [draftStatus, setDraftStatus] = useState('All Status');
  const [draftSortBy, setDraftSortBy] = useState('newest');
  const [mobileSelectOpen, setMobileSelectOpen] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/admin/category');
      if (response.data.success && Array.isArray(response.data.data)) {
        const catNames = response.data.data.map((c) => c.name);
        setCategoriesList(['All Categories', ...new Set(catNames)]);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          axios.get('/api/admin/products'),
          axios.get('/api/admin/category'),
        ]);
        if (!ignore) {
          if (prodRes.status === 'fulfilled' && prodRes.value.data?.success) {
            setProducts(prodRes.value.data.data);
          }
          if (
            catRes.status === 'fulfilled' &&
            catRes.value.data?.success &&
            Array.isArray(catRes.value.data.data)
          ) {
            const catNames = catRes.value.data.data.map((c) => c.name);
            setCategoriesList(['All Categories', ...new Set(catNames)]);
          }
        }
      } catch (err) {
        console.error('Initial products load error:', err);
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

  const activeFilterCount = [
    categoryFilter !== 'All Categories',
    statusFilter !== 'All Status',
    sortBy !== 'newest',
  ].filter(Boolean).length;

  const openMobileFilters = () => {
    setDraftCategory(categoryFilter);
    setDraftStatus(statusFilter);
    setDraftSortBy(sortBy);
    setMobileSelectOpen(null);
    setIsFilterModalOpen(true);
  };

  const applyMobileFilters = () => {
    setCategoryFilter(draftCategory);
    setStatusFilter(draftStatus);
    setSortBy(draftSortBy);
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  const resetMobileFilters = () => {
    setDraftCategory('All Categories');
    setDraftStatus('All Status');
    setDraftSortBy('newest');
    setMobileSelectOpen(null);
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.sku && product.sku.toLowerCase().includes(query)) ||
        (product.slug && product.slug.toLowerCase().includes(query));

      const matchesCategory =
        categoryFilter === 'All Categories' ||
        product.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'All Status' ||
        product.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'stock-asc':
          return a.stock - b.stock;
        case 'stock-desc':
          return b.stock - a.stock;
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [products, search, categoryFilter, statusFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const changeSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const toggleFeatured = async (product) => {
    const id = product._id || product.id;
    const newFeatured = !product.featured;
    try {
      await axios.put('/api/admin/products', {
        id,
        featured: newFeatured,
      });
      setProducts((current) =>
        current.map((p) =>
          (p._id || p.id) === id
            ? { ...p, featured: newFeatured }
            : p
        )
      );
      toast.success(newFeatured ? 'Product marked as featured' : 'Product removed from featured');
    } catch (error) {
      console.error('Toggle featured error:', error);
      toast.error('Failed to update featured status');
    }
  };

  const confirmDelete = async () => {
    if (!deleteProduct) return;
    const id = deleteProduct._id || deleteProduct.id;
    try {
      await axios.delete(`/api/admin/products?id=${id}`);
      setProducts((current) =>
        current.filter((product) => (product._id || product.id) !== id)
      );
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Delete product error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeleteProduct(null);
    }
  };


  const renderMobileSelect = ({
    id,
    label,
    value,
    options,
    onChange,
  }) => {
    const isOpen = mobileSelectOpen === id;

    return (
      <div className="relative w-full">
        <label className="mb-2 block text-sm text-[#a3a3a3]">
          {label}
        </label>

        <button
          type="button"
          onClick={() => setMobileSelectOpen(isOpen ? null : id)}
          className={`${inputClass} flex items-center justify-between gap-3 rounded-xl text-left`}
        >
          <span className="truncate">
            {options.find((option) => option.value === value)?.label ||
              value}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-[#a3a3a3] transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-[80] mt-2 max-h-52 overflow-y-auto rounded-xl border border-[#444444] bg-[#353638] p-1.5 shadow-xl">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setMobileSelectOpen(null);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors ${
                  value === option.value
                    ? 'bg-[#454648] text-white'
                    : 'text-[#c4c4c4] hover:bg-[#404143]'
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <Check size={16} className="shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const categoryOptions = categories.map((category) => ({
    label: category,
    value: category,
  }));

  const statusOptions = statuses.map((status) => ({
    label: status,
    value: status,
  }));

  return (
    <div className="min-w-0 text-[#e5e5e5] w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-[#a3a3a3]">
            Manage your store products and inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/admin/dashboard/products/add')}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-200 sm:w-auto"
        >
          <Plus size={17} />
          Add Product
        </button>
      </div>

      <div className="my-6 h-px w-full bg-[#353638] sm:my-8" />

      {/* Search and filters */}
      {/* Search and filters */}
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2 sm:gap-3 md:grid-cols-[minmax(220px,1fr)_auto_auto]">
        <div className="relative min-w-0">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888] sm:left-4"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => changeSearch(event.target.value)}
            placeholder="Search products by name, SKU or slug..."
            className={`${inputClass} pl-10 sm:pl-11`}
          />
        </div>

        {/* Desktop category filter */}
        <div className="hidden w-full md:block md:w-[180px]">
          <Dropdown
            value={categoryFilter}
            options={categoriesList}
            onChange={setCategoryFilter}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            dropdownId="product-category"
          />
        </div>

        {/* Desktop status filter */}
        <div className="hidden w-full md:block md:w-[160px]">
          <Dropdown
            value={statusFilter}
            options={statuses}
            onChange={setStatusFilter}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            dropdownId="product-status"
          />
        </div>

        {/* Mobile filter button */}
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
          {filteredProducts.length}{' '}
          {filteredProducts.length === 1 ? 'product' : 'products'} found
        </p>

        {(search ||
          categoryFilter !== 'All Categories' ||
          statusFilter !== 'All Status' ||
          sortBy !== 'newest') && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCategoryFilter('All Categories');
              setStatusFilter('All Status');
              setSortBy('newest');
              setCurrentPage(1);
            }}
            className="text-sm text-[#a3a3a3] transition-colors hover:text-white"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <TableSkeleton columns={7} rows={8} minWidth="w-full" />
      ) : (
        <>
          {/* Desktop product table */}
          <div className="mt-4 hidden md:block">
            <div className="overflow-x-auto rounded-xl border border-[#353638]">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#353638] bg-[#252628] text-xs uppercase tracking-wider text-[#888888]">
                    <th className="px-4 py-3.5 font-medium">Product</th>
                    <th className="px-4 py-3.5 font-medium">Category</th>
                    <th className="px-4 py-3.5 font-medium">Price</th>
                    <th className="px-4 py-3.5 font-medium">Stock</th>
                    <th className="px-4 py-3.5 font-medium">Status</th>
                    <th className="px-4 py-3.5 text-center font-medium">Featured</th>
                    <th className="px-4 py-3.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#353638]">
                  {paginatedProducts.map((product) => {
                    const productKey = product._id || product.id || product.slug;
                    return (
                      <tr
                        key={productKey}
                        className="transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex min-w-0 items-center gap-3">
                            <ProductImage
                              src={product.image}
                              name={product.name}
                            />
                            <div className="min-w-0">
                              <p className="max-w-[220px] truncate text-sm font-medium text-[#e5e5e5]">
                                {product.name}
                              </p>
                              {product.sku && (
                                <p className="mt-0.5 text-xs text-[#888888]">
                                  SKU: {product.sku}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-sm text-[#b5b5b5]">
                          {product.category}
                        </td>

                        <td className="px-4 py-3.5 text-sm font-medium text-[#e5e5e5]">
                          {formatPrice(product.price)}
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`text-sm ${
                              product.stock === 0
                                ? 'text-red-400'
                                : product.stock <= 10
                                  ? 'text-amber-400'
                                  : 'text-[#b5b5b5]'
                            }`}
                          >
                            {product.stock} units
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs ${getStatusStyle(
                              product.status
                            )}`}
                          >
                            {product.status}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => toggleFeatured(product)}
                            aria-label={
                              product.featured
                                ? 'Remove from featured'
                                : 'Mark as featured'
                            }
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                              product.featured
                                ? 'text-amber-400 hover:bg-amber-400/10'
                                : 'text-[#666666] hover:bg-white/5 hover:text-[#bbbbbb]'
                            }`}
                          >
                            <Star
                              size={17}
                              fill={product.featured ? 'currentColor' : 'none'}
                            />
                          </button>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(`/admin/dashboard/products/edit/${product._id || product.id}`)
                              }
                              aria-label={`Edit ${product.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a3a3a3] transition-colors hover:bg-white/10 hover:text-white"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteProduct(product)}
                              aria-label={`Delete ${product.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a3a3a3] transition-colors hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {paginatedProducts.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#353638] text-[#888888]">
                            <Package size={24} />
                          </div>
                          <h3 className="mt-4 text-sm font-medium text-[#e5e5e5]">
                            No products found
                          </h3>
                          <p className="mt-1 max-w-xs text-sm text-[#888888]">
                            Try changing your search or filters to find what you are looking for.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSearch('');
                              setCategoryFilter('All Categories');
                              setStatusFilter('All Status');
                              setSortBy('newest');
                              setCurrentPage(1);
                            }}
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

      {/* Mobile product list */}
      <div className="mt-4 space-y-3 md:hidden">
        {paginatedProducts.map((product) => {
          const productKey = product._id || product.id || product.slug;
          return (
            <div
              key={productKey}
              className="flex min-w-0 gap-3 border-b border-[#353638] py-4"
            >
              <ProductImage src={product.image} name={product.name} />

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="break-words text-sm font-medium text-[#e5e5e5]">
                      {product.name}
                    </h3>
                    {product.sku && (
                      <p className="mt-1 text-xs text-[#888888]">
                        SKU: {product.sku}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFeatured(product)}
                    aria-label={
                      product.featured
                        ? 'Remove from featured'
                        : 'Mark as featured'
                    }
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      product.featured
                        ? 'text-amber-400'
                        : 'text-[#666666]'
                    }`}
                  >
                    <Star
                      size={16}
                      fill={product.featured ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-[#555555]">·</span>
                  <span className="text-xs text-[#a3a3a3]">
                    {product.category}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${getStatusStyle(
                      product.status
                    )}`}
                  >
                    {product.status}
                  </span>

                  <span
                    className={`text-xs ${
                      product.stock === 0
                        ? 'text-red-400'
                        : product.stock <= 10
                          ? 'text-amber-400'
                          : 'text-[#a3a3a3]'
                    }`}
                  >
                    {product.stock} in stock
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/admin/dashboard/products/edit/${product._id || product.id}`)
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#444444] px-3 py-1.5 text-xs text-[#d4d4d4] transition-colors hover:border-[#666666] hover:text-white"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteProduct(product)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#444444] px-3 py-1.5 text-xs text-[#d4d4d4] transition-colors hover:border-red-500/40 hover:text-red-400"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {paginatedProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#353638] text-[#888888]">
              <Package size={24} />
            </div>
            <h3 className="mt-4 text-sm font-medium text-[#e5e5e5]">
              No products found
            </h3>
            <p className="mt-1 max-w-xs text-sm text-[#888888]">
              Try changing your search or filters to find what you are looking for.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategoryFilter('All Categories');
                setStatusFilter('All Status');
                setSortBy('newest');
                setCurrentPage(1);
              }}
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
      {filteredProducts.length > 0 && (
        <div className="mt-6 flex flex-col gap-4 border-t border-[#353638] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#888888]">
            Showing {(safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, filteredProducts.length)} of{' '}
            {filteredProducts.length} products
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
                setCurrentPage((page) => Math.min(totalPages, page + 1))
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
                  Refine your product list.
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
              {renderMobileSelect({
                id: 'mobile-category',
                label: 'Category',
                value: draftCategory,
                options: categoryOptions,
                onChange: setDraftCategory,
              })}

              {renderMobileSelect({
                id: 'mobile-status',
                label: 'Status',
                value: draftStatus,
                options: statusOptions,
                onChange: setDraftStatus,
              })}

              {renderMobileSelect({
                id: 'mobile-sort',
                label: 'Sort by',
                value: draftSortBy,
                options: sortOptions,
                onChange: setDraftSortBy,
              })}
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
      {deleteProduct && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setDeleteProduct(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            className="w-full max-w-sm rounded-2xl border border-[#444444] bg-[#252628] p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <Trash2 size={20} />
            </div>

            <h2
              id="delete-product-title"
              className="mt-4 text-lg font-semibold"
            >
              Delete product?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#a3a3a3]">
              Are you sure you want to delete{' '}
              <span className="font-medium text-[#e5e5e5]">
                {deleteProduct.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteProduct(null)}
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