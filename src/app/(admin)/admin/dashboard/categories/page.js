"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Plus,
  Folder,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  X,
  SlidersHorizontal,
  Check,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { TableRowsSkeleton, CardListSkeleton } from "@/components/admin/AdminSkeleton";

const statuses = ["All Status", "Active", "Inactive"];

const inputClass =
  "w-full min-w-0 bg-[#353638] border border-[#444444] text-[#e5e5e5] text-sm rounded-full px-4 py-2.5 outline-none focus:border-[#666666] transition-colors";

const statusStyle = (status) =>
  status?.toLowerCase() === "active"
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : "bg-red-500/10 text-red-400 border-red-500/20";

function makeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function StatusBadge({ status }) {
  const isActive = status?.toLowerCase() === "active";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs ${statusStyle(
        status
      )}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-400" : "bg-red-400"
        }`}
      />

      {isActive ? "Active" : "Inactive"}
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
        onClick={() =>
          setOpenDropdown(isOpen ? null : dropdownId)
        }
        className={`${inputClass} flex items-center justify-between gap-3 text-left`}
      >
        <span className="truncate">{value}</span>

        <ChevronDown
          size={15}
          className={`shrink-0 text-[#a3a3a3] transition-transform ${
            isOpen ? "rotate-180" : ""
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

          <div className="absolute left-0 top-full z-30 mt-2 max-h-60 w-full min-w-[150px] overflow-y-auto rounded-xl border border-[#444444] bg-[#353638] p-1.5 shadow-xl">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpenDropdown(null);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  value === option
                    ? "bg-[#454648] text-white"
                    : "text-[#c4c4c4] hover:bg-[#404143] hover:text-white"
                }`}
              >
                <span>{option}</span>

                {value === option && <Check size={15} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Page() {
  /*
   * ================================
   * DATA
   * ================================
   */

  const [categories, setCategories] = useState([]);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    perPage: 8,
    hasNextPage: false,
    hasPreviousPage: false,
    nextPage: null,
    previousPage: null,
  });

  const [loading, setLoading] = useState(false);
  // Separate from mutation `loading` so the list shows a skeleton on first paint
  const [listLoading, setListLoading] = useState(true);

  /*
   * ================================
   * SEARCH / FILTER
   * ================================
   */

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  /*
   * ================================
   * DROPDOWNS
   * ================================
   */

  const [openDropdown, setOpenDropdown] =
    useState(null);

  /*
   * ================================
   * ADD / EDIT MODAL
   * ================================
   */

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    status: "active",
    showSection: false,
  });

  /*
   * ================================
   * DELETE MODAL
   * ================================
   */

  const [deleteCategory, setDeleteCategory] =
    useState(null);

  /*
   * ================================
   * MOBILE FILTER
   * ================================
   */

  const [isFilterModalOpen, setIsFilterModalOpen] =
    useState(false);

  const [draftStatus, setDraftStatus] =
    useState("All Status");

  /*
   * ================================
   * FILTER COUNT
   * ================================
   */

  const activeFilterCount =
    statusFilter !== "All Status" ? 1 : 0;

  /*
   * ================================
   * FETCH CATEGORIES
   * ================================
   */

  const fetchCategories = useCallback(async () => {
    try {
      setListLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (statusFilter !== "All Status") {
        params.set(
          "status",
          statusFilter.toLowerCase()
        );
      }

      params.set("page", currentPage);
      params.set("limit", itemsPerPage);

      const response = await axios.get(
        `/api/admin/category?${params.toString()}`
      );

      if (response.data.success) {
        setCategories(response.data.data || []);

        setPagination(
          response.data.pagination || {
            total: 0,
            totalPages: 1,
            currentPage: 1,
            perPage: itemsPerPage,
            hasNextPage: false,
            hasPreviousPage: false,
            nextPage: null,
            previousPage: null,
          }
        );
      }
    } catch (error) {
      console.error(
        "Fetch categories error:",
        error
      );

      window.alert(
        error.response?.data?.message ||
          "Failed to load categories"
      );
    } finally {
      setListLoading(false);
    }
  }, [search, statusFilter, currentPage, itemsPerPage]);

  /*
   * ================================
   * FETCH ON SEARCH/FILTER/PAGE
   * ================================
   */

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (isMounted) {
        await fetchCategories();
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [fetchCategories]);

  /*
   * ================================
   * OPEN ADD MODAL
   * ================================
   */

  const handleAddCategory = () => {
    setEditingCategory(null);

    setFormData({
      name: "",
      slug: "",
      status: "active",
      showSection: false,
    });

    setIsModalOpen(true);
  };

  /*
   * ================================
   * OPEN EDIT MODAL
   * ================================
   */

  const handleEditCategory = (category) => {
    setEditingCategory(category);

    setFormData({
      name: category.name || "",
      slug: category.slug || "",
      status: category.status || "active",
      showSection: category.show_section ?? false,
    });

    setIsModalOpen(true);
  };

  /*
   * ================================
   * SUBMIT CREATE / UPDATE
   * ================================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();

    const slug = makeSlug(
      formData.slug || name
    );

    if (!name || !slug) {
      toast.error("Category name and slug are required.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name,
        slug,
        status: formData.status,
        show_section: formData.showSection,
      };

      let response;

      /*
       * UPDATE
       */

      if (editingCategory) {
        response = await axios.put(
          "/api/admin/category",
          {
            id: editingCategory._id,
            ...payload,
          }
        );
      }

      /*
       * CREATE
       */

      else {
        response = await axios.post(
          "/api/admin/category",
          payload
        );
      }

      if (response.data.success) {
        toast.success(
          editingCategory
            ? "Category updated successfully"
            : "Category created successfully"
        );

        setIsModalOpen(false);

        setEditingCategory(null);

        setFormData({
          name: "",
          slug: "",
          status: "active",
          showSection: false,
        });

        await fetchCategories();
      }
    } catch (error) {
      console.error(
        "Save category error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to save category"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ================================
   * DELETE CATEGORY
   * ================================
   */

  const handleDeleteCategory = async () => {
    if (!deleteCategory) return;

    try {
      setLoading(true);

      const response = await axios.delete(
        `/api/admin/category?id=${deleteCategory._id}`
      );

      if (response.data.success) {
        toast.success("Category deleted successfully");
        setDeleteCategory(null);

        /*
         * If deleting the last item
         * on a page, go back one page.
         */

        if (
          categories.length === 1 &&
          currentPage > 1
        ) {
          setCurrentPage(
            (page) => page - 1
          );
        } else {
          await fetchCategories();
        }
      }
    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete category"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ================================
   * TOGGLE SECTION VISIBILITY
   * ================================
   */

  const toggleSectionVisibility = async (
    category
  ) => {
    try {
      setLoading(true);

      const response = await axios.put(
        "/api/admin/category",
        {
          id: category._id,
          show_section: !category.show_section,
        }
      );

      if (response.data.success) {
        toast.success(
          category.show_section
            ? "Removed from home section"
            : "Added to home section"
        );
        await fetchCategories();
      }
    } catch (error) {
      console.error(
        "Toggle section error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update section visibility"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ================================
   * MOBILE FILTER
   * ================================
   */

  const openMobileFilters = () => {
    setDraftStatus(statusFilter);

    setIsFilterModalOpen(true);
  };

  const applyMobileFilters = () => {
    setStatusFilter(draftStatus);

    setCurrentPage(1);

    setIsFilterModalOpen(false);
  };

  const resetMobileFilters = () => {
    setDraftStatus("All Status");
  };

  /*
   * ================================
   * CLEAR FILTERS
   * ================================
   */

  const clearFilters = () => {
    setSearch("");

    setStatusFilter("All Status");

    setDraftStatus("All Status");

    setCurrentPage(1);
  };

  /*
   * ================================
   * DATE FORMAT
   * ================================
   */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }
    );
  };

  /*
   * ================================
   * RENDER
   * ================================
   */

  return (
    <div className="min-w-0 w-full text-[#e5e5e5]">

      {/* ================================= */}
      {/* PAGE HEADER */}
      {/* ================================= */}

      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Categories
          </h1>

          <p className="mt-1 max-w-xl text-sm leading-5 text-[#a3a3a3]">
            Manage your product categories and organize
            your store.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddCategory}
          disabled={loading}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <Plus size={17} />

          Add Category
        </button>
      </div>

      <div className="my-6 h-px w-full bg-[#353638] sm:my-8" />

      {/* ================================= */}
      {/* SEARCH + FILTER */}
      {/* ================================= */}

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2 sm:gap-3 md:grid-cols-[minmax(220px,1fr)_minmax(0,1fr)]">

        {/* SEARCH */}

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
            placeholder="Search categories..."
            className={`${inputClass} pl-10 sm:pl-11`}
          />
        </div>

        {/* DESKTOP FILTER */}

        <div className="hidden w-full md:block md:max-w-[220px] md:justify-self-end">
          <Dropdown
            value={statusFilter}
            options={statuses}
            onChange={setStatusFilter}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            dropdownId="category-status"
          />
        </div>

        {/* MOBILE FILTER */}

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

      {/* ================================= */}
      {/* RESULTS */}
      {/* ================================= */}

      <div className="mt-5 flex min-w-0 items-center justify-between gap-3">
        <p className="text-sm text-[#a3a3a3]">
          {pagination.total}{" "}
          {pagination.total === 1
            ? "category"
            : "categories"}{" "}
          found
        </p>

        {(search ||
          statusFilter !== "All Status") && (
          <button
            type="button"
            onClick={clearFilters}
            className="shrink-0 text-sm text-[#a3a3a3] transition-colors hover:text-white"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ================================= */}
      {/* ================================= */}
      {/* DESKTOP TABLE */}
      {/* ================================= */}

      <div className="mt-4 hidden md:block">
        <div className="overflow-x-auto rounded-xl border border-[#353638]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#353638] bg-[#252628] text-xs uppercase tracking-wider text-[#888888]">
                <th className="px-4 py-3.5 font-medium">Category</th>
                <th className="px-4 py-3.5 font-medium">Slug</th>
                <th className="px-4 py-3.5 font-medium">Status</th>
                <th className="px-4 py-3.5 font-medium">Created</th>
                <th className="px-4 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#353638]">
              {listLoading ? (
                <TableRowsSkeleton columns={5} rows={6} withAvatar />
              ) : (
                categories.map((category) => (
                  <tr
                    key={category._id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    {/* CATEGORY */}
                    <td className="px-4 py-3.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#353638] text-[#c4c4c4]">
                          <Folder size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate text-sm font-medium text-[#e5e5e5]">
                            {category.name}
                          </p>

                          <p className="mt-0.5 text-xs text-[#888888]">
                            Category
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SLUG */}
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-[#a3a3a3]">
                        /{category.slug}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={category.status} />
                        {category.show_section && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-400">
                            Home Section
                          </span>
                        )}
                      </div>
                    </td>

                    {/* CREATED */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#a3a3a3]">
                      {formatDate(category.createdAt)}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditCategory(category)}
                          aria-label={`Edit ${category.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a3a3a3] transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteCategory(category)}
                          aria-label={`Delete ${category.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a3a3a3] transition-colors hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!listLoading && categories.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#353638] text-[#888888]">
                        <Folder size={24} />
                      </div>

                      <h3 className="mt-4 text-sm font-medium text-[#e5e5e5]">
                        No categories found
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

      {/* ================================= */}
      {/* MOBILE LIST */}
      {/* ================================= */}

      <div className="mt-4 divide-y divide-[#353638] md:hidden">
        {listLoading && <CardListSkeleton count={5} />}
        {!listLoading && categories.map((category) => (
          <div
            key={category._id}
            className="flex min-w-0 gap-3 py-4"
          >

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#353638] text-[#c4c4c4] sm:h-11 sm:w-11">
              <Folder size={18} />
            </div>

            <div className="min-w-0 flex-1">

              <div className="flex min-w-0 items-start justify-between gap-2">

                <div className="min-w-0 flex-1">

                  <h3 className="break-words text-sm font-medium leading-5 text-[#e5e5e5]">
                    {category.name}
                  </h3>

                  <p className="mt-1 break-all text-xs text-[#888888]">
                    /{category.slug}
                  </p>

                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge
                    status={category.status}
                  />
                  {category.show_section && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-400">
                      Home Section
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex min-w-0 items-center justify-between gap-2">

                <span className="min-w-0 truncate text-[11px] text-[#777777]">
                  Created{" "}
                  {formatDate(
                    category.createdAt
                  )}
                </span>

                <div className="flex shrink-0 items-center gap-2">

                  {/* EDIT */}

                  <button
                    type="button"
                    onClick={() =>
                      handleEditCategory(
                        category
                      )
                    }
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#444444] px-3 text-xs text-[#d4d4d4] transition-colors hover:bg-[#353638] hover:text-white"
                  >
                    <Edit3 size={13} />

                    Edit
                  </button>

                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteCategory(
                        category
                      )
                    }
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#444444] px-3 text-xs text-[#d4d4d4] transition-colors hover:border-red-500/40 hover:text-red-400"
                  >
                    <Trash2 size={13} />

                    Delete
                  </button>

                </div>
              </div>
            </div>
          </div>
        ))}

        {!listLoading && categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#353638] text-[#888888]">
              <Folder size={24} />
            </div>

            <h3 className="mt-4 text-sm font-medium text-[#e5e5e5]">
              No categories found
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

      {/* ================================= */}
      {/* PAGINATION */}
      {/* ================================= */}

      {pagination.total > 0 && (
        <div className="mt-6 flex min-w-0 flex-col gap-3 border-t border-[#353638] pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

          <p className="text-xs text-[#888888]">

            Showing{" "}

            {(pagination.currentPage - 1) *
              pagination.perPage +
              1}

            –

            {Math.min(
              pagination.currentPage *
                pagination.perPage,
              pagination.total
            )}

            {" "}of{" "}

            {pagination.total}

            {" "}categories
          </p>

          <div className="flex items-center justify-between gap-2 sm:justify-end">

            {/* PREVIOUS */}

            <button
              type="button"
              disabled={
                !pagination.hasPreviousPage ||
                loading ||
                listLoading
              }
              onClick={() =>
                setCurrentPage(
                  pagination.previousPage
                )
              }
              aria-label="Previous page"
              className="inline-flex h-9 items-center justify-center gap-1 rounded-full border border-[#444444] px-3 text-sm text-[#c4c4c4] transition-colors hover:bg-[#353638] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />

              <span className="hidden sm:inline">
                Previous
              </span>
            </button>

            {/* PAGE */}

            <span className="min-w-[64px] text-center text-sm text-[#a3a3a3]">
              {pagination.currentPage} /{" "}
              {pagination.totalPages}
            </span>

            {/* NEXT */}

            <button
              type="button"
              disabled={
                !pagination.hasNextPage ||
                loading ||
                listLoading
              }
              onClick={() =>
                setCurrentPage(
                  pagination.nextPage
                )
              }
              aria-label="Next page"
              className="inline-flex h-9 items-center justify-center gap-1 rounded-full border border-[#444444] px-3 text-sm text-[#c4c4c4] transition-colors hover:bg-[#353638] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="hidden sm:inline">
                Next
              </span>

              <ChevronRight size={16} />
            </button>

          </div>
        </div>
      )}

      {/* ================================= */}
      {/* MOBILE FILTER MODAL */}
      {/* ================================= */}

      {isFilterModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
          onClick={() =>
            setIsFilterModalOpen(false)
          }
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-filter-title"
            className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border border-[#444444] bg-[#252628] p-5 pb-[max(20px,env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-2xl sm:p-6"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex items-center justify-between gap-3">

              <div>
                <h2
                  id="category-filter-title"
                  className="text-lg font-semibold"
                >
                  Filters
                </h2>

                <p className="mt-1 text-sm text-[#888888]">
                  Refine your category list.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsFilterModalOpen(false)
                }
                aria-label="Close filters"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#a3a3a3] hover:bg-[#353638] hover:text-white"
              >
                <X size={19} />
              </button>

            </div>

            <div className="mt-6">

              <label
                htmlFor="mobile-category-status"
                className="mb-2 block text-sm text-[#a3a3a3]"
              >
                Status
              </label>

              <div className="relative">

                <select
                  id="mobile-category-status"
                  value={draftStatus}
                  onChange={(event) =>
                    setDraftStatus(
                      event.target.value
                    )
                  }
                  className={`${inputClass} appearance-none rounded-xl pr-10`}
                >
                  {statuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#888888]"
                />

              </div>
            </div>

            <div className="mt-7 flex gap-3 border-t border-[#444444] pt-5">

              <button
                type="button"
                onClick={resetMobileFilters}
                className="flex-1 rounded-full border border-[#444444] px-4 py-3 text-sm font-medium text-[#e5e5e5] hover:bg-[#353638]"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={applyMobileFilters}
                className="flex-1 rounded-full bg-white px-4 py-3 text-sm font-medium text-black hover:bg-gray-200"
              >
                Apply Filters
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ================================= */}
      {/* ADD / EDIT MODAL */}
      {/* ================================= */}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
          onClick={() => {
            if (!loading) {
              setIsModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-form-title"
            className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-[#444444] bg-[#252628] pb-[env(safe-area-inset-bottom)] sm:max-w-md sm:rounded-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-center justify-between gap-3 border-b border-[#444444] px-5 py-5 sm:px-6">

              <div className="min-w-0">

                <h2
                  id="category-form-title"
                  className="text-lg font-semibold"
                >
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>

                <p className="mt-1 text-sm text-[#888888]">
                  {editingCategory
                    ? "Update your category information."
                    : "Create a new product category."}
                </p>

              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setIsModalOpen(false)
                }
                aria-label="Close category form"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#a3a3a3] hover:bg-[#353638] hover:text-white disabled:opacity-40"
              >
                <X size={18} />
              </button>

            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>

              <div className="space-y-5 p-5 sm:p-6">

                {/* NAME */}

                <div>

                  <label
                    htmlFor="category-name"
                    className="mb-2 block text-sm text-[#a3a3a3]"
                  >
                    Category Name
                  </label>

                  <input
                    id="category-name"
                    type="text"
                    value={formData.name}
                    onChange={(event) => {
                      const name =
                        event.target.value;

                      setFormData(
                        (previous) => ({
                          ...previous,
                          name,

                          slug: editingCategory
                            ? previous.slug
                            : makeSlug(name),
                        })
                      );
                    }}
                    placeholder="e.g. Electronics"
                    className={`${inputClass} rounded-xl`}
                    required
                  />

                </div>

                {/* SLUG */}

                <div>

                  <label
                    htmlFor="category-slug"
                    className="mb-2 block text-sm text-[#a3a3a3]"
                  >
                    Slug
                  </label>

                  <div className="flex min-w-0 items-center overflow-hidden rounded-xl border border-[#444444] bg-[#353638] focus-within:border-[#666666]">

                    <span className="pl-4 text-sm text-[#777777]">
                      /
                    </span>

                    <input
                      id="category-slug"
                      type="text"
                      value={formData.slug}
                      onChange={(event) =>
                        setFormData(
                          (previous) => ({
                            ...previous,

                            slug: makeSlug(
                              event.target.value
                            ),
                          })
                        )
                      }
                      placeholder="electronics"
                      className="w-full min-w-0 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-[#666666]"
                      required
                    />

                  </div>

                </div>

                {/* STATUS */}

                <div>

                  <label
                    htmlFor="category-status"
                    className="mb-2 block text-sm text-[#a3a3a3]"
                  >
                    Status
                  </label>

                  <div className="relative">

                    <select
                      id="category-status"
                      value={formData.status}
                      onChange={(event) =>
                        setFormData(
                          (previous) => ({
                            ...previous,

                            status:
                              event.target.value,
                          })
                        )
                      }
                      className={`${inputClass} appearance-none rounded-xl pr-10`}
                    >
                      <option value="active">
                        Active
                      </option>

                      <option value="inactive">
                        Inactive
                      </option>
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#888888]"
                    />

                  </div>
                </div>

                {/* SHOW SECTION */}

                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#444444] bg-[#353638] p-4 transition-colors hover:bg-[#3b3c3e]">

                  <div className="min-w-0">

                    <p className="text-sm font-medium text-[#e5e5e5]">
                      Show section
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#888888]">
                      Display this category as a product section on the store home page.
                    </p>

                  </div>

                  <input
                    type="checkbox"
                    checked={
                      formData.showSection
                    }
                    onChange={(event) =>
                      setFormData(
                        (previous) => ({
                          ...previous,

                          showSection:
                            event.target.checked,
                        })
                      )
                    }
                    className="h-4 w-4 shrink-0 accent-white"
                  />

                </label>

              </div>

              {/* FOOTER */}

              <div className="flex flex-col-reverse gap-3 border-t border-[#444444] px-5 py-5 sm:flex-row sm:justify-end sm:px-6">

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  className="w-full rounded-full border border-[#444444] px-5 py-2.5 text-sm text-[#d4d4d4] transition-colors hover:bg-[#353638] disabled:opacity-40 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {loading && (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  )}

                  {editingCategory
                    ? "Save Changes"
                    : "Create Category"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================= */}
      {/* DELETE MODAL */}
      {/* ================================= */}

      {deleteCategory && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
          onClick={() =>
            setDeleteCategory(null)
          }
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            className="w-full max-w-sm rounded-2xl border border-[#444444] bg-[#252628] p-5 shadow-2xl sm:p-6"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <Trash2 size={20} />
            </div>

            <h2
              id="delete-category-title"
              className="mt-4 text-lg font-semibold text-[#e5e5e5]"
            >
              Delete category?
            </h2>

            <p className="mt-2 break-words text-sm leading-6 text-[#a3a3a3]">
              Are you sure you want to delete{" "}

              <span className="font-medium text-[#e5e5e5]">
                {deleteCategory.name}
              </span>

              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setDeleteCategory(null)
                }
                className="flex-1 rounded-full border border-[#444444] px-4 py-2.5 text-sm text-[#e5e5e5] transition-colors hover:bg-[#353638] disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={
                  handleDeleteCategory
                }
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading && (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                )}

                Delete
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}