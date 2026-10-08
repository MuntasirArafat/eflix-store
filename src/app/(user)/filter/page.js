"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  ArrowDownUp,
  ChevronDown,
  Filter,
  Search,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/context/LanguageContext";

const MIN_PRICE = 0;
const MAX_PRICE = 10000;

function FilterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const urlSearch = searchParams.get("search") || "";
  const urlCategory =
    searchParams.get("category") ||
    searchParams.get("cetagory") ||
    "All Products";

  const [search, setSearch] = useState(urlSearch);
  const [category, setCategory] = useState(urlCategory);
  const [sort, setSort] = useState("low");
  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Products and Categories states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    { name: "All Products", count: 0 },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  // Sync state if URL query params change externally
  useEffect(() => {
    const paramCat =
      searchParams.get("category") ||
      searchParams.get("cetagory") ||
      "All Products";
    const paramSearch = searchParams.get("search") || "";

    if (paramCat !== category || paramSearch !== search) {
      queueMicrotask(() => {
        setCategory(paramCat);
        setSearch(paramSearch);
        setIsLoading(true);
      });
    }
  }, [searchParams, category, search]);

  // Load Categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await axios.get("/api/categories");
        if (res.data?.success && Array.isArray(res.data.data)) {
          const totalCount = res.data.data.reduce(
            (acc, cur) => acc + (cur.productCount || 0),
            0
          );
          const formatted = [
            { name: "All Products", count: totalCount },
            ...res.data.data.map((c) => ({
              name: c.name,
              count: c.productCount || 0,
            })),
          ];
          setCategories(formatted);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();

      if (search.trim()) params.append("search", search.trim());
      if (category && category !== "All Products") {
        params.append("category", category);
      }
      const featuredParam = searchParams.get("featured");
      if (featuredParam) {
        params.append("featured", featuredParam);
      }

      if (priceRange[0] > MIN_PRICE) {
        params.append("minPrice", priceRange[0].toString());
      }
      if (priceRange[1] < MAX_PRICE) {
        params.append("maxPrice", priceRange[1].toString());
      }

      // Map sort
      if (sort === "low") params.append("sort", "price-asc");
      else if (sort === "high") params.append("sort", "price-desc");
      else params.append("sort", "newest");

      params.append("page", pagination.currentPage.toString());
      params.append("limit", "12");

      const res = await axios.get(`/api/products?${params.toString()}`);
      if (res.data?.success) {
        setProducts(res.data.data || []);
        if (res.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalPages: res.data.pagination.totalPages,
            total: res.data.pagination.total,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, category, sort, priceRange, pagination.currentPage, searchParams]);

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleCategorySelect = (val) => {
    setCategory(val);
    setIsLoading(true);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));

    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("cetagory");
    if (val && val !== "All Products") {
      params.set("category", val);
    }
    const q = params.toString();
    router.replace(`/filter${q ? `?${q}` : ""}`, { scroll: false });
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setIsLoading(true);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));

    const params = new URLSearchParams(searchParams.toString());
    if (val.trim()) {
      params.set("search", val.trim());
    } else {
      params.delete("search");
    }
    const q = params.toString();
    router.replace(`/filter${q ? `?${q}` : ""}`, { scroll: false });
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("All Products");
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSort("low");
    setIsLoading(true);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    router.replace("/filter", { scroll: false });
  };

  return (
    <div className="px-4 mt-8 md:px-8 pb-20">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
        {/* ================================================= */}
        {/* DESKTOP SIDEBAR */}
        {/* ================================================= */}
        <aside className="hidden md:col-span-1 md:block lg:col-span-1">
          <div className="sticky top-20 rounded-xl border bg-background p-4">
            {/* Filter heading */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <h2 className="text-sm font-semibold">{t("filter_by_category")}</h2>
              </div>

              <button
                onClick={resetFilters}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("reset_filter")}
              </button>
            </div>

            {/* CATEGORIES */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("filter_by_category")}
              </h3>

              <RadioGroup
                value={category}
                onValueChange={handleCategorySelect}
                className="space-y-1"
              >
                {categories.map((item) => {
                  const isSelected = category === item.name;
                  return (
                    <div
                      key={item.name}
                      className={`flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-muted ${
                        isSelected ? "bg-muted/70 text-[#f51b25] font-semibold" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <RadioGroupItem value={item.name} id={`desk-${item.name}`} />
                        <Label
                          htmlFor={`desk-${item.name}`}
                          className="cursor-pointer text-xs font-medium flex items-center gap-1.5"
                        >
                          {item.name === "All Products" ? t("all_products") : item.name}
                        </Label>
                      </div>

                      <span className="text-[11px] text-muted-foreground">
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            <Separator className="my-5" />

            {/* PRICE RANGE */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("price_range")}
                </h3>

                <span className="text-xs text-muted-foreground">
                  ৳{priceRange[0]} - ৳{priceRange[1]}
                </span>
              </div>

              <Slider
                value={priceRange}
                onValueChange={(val) => {
                  setPriceRange(val);
                  setPagination((p) => ({ ...p, currentPage: 1 }));
                }}
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={100}
                className="mb-4"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="mb-1 block text-[11px] text-muted-foreground">
                    Min
                  </Label>
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPriceRange([Math.min(val, priceRange[1]), priceRange[1]]);
                    }}
                    className="h-8 text-xs"
                  />
                </div>

                <div>
                  <Label className="mb-1 block text-[11px] text-muted-foreground">
                    Max
                  </Label>
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPriceRange([priceRange[0], Math.max(val, priceRange[0])]);
                    }}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ================================================= */}
        {/* MAIN CONTENT */}
        {/* ================================================= */}
        <main className="md:col-span-5 lg:col-span-5">
          {/* TOP CONTROLS */}
          <div className="mb-6 rounded-xl border bg-background p-3 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* SEARCH */}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t("search_placeholder")}
                  className="h-10 pl-9 pr-3 text-sm"
                />
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-between gap-3 lg:justify-end">
                {/* MOBILE FILTER TRIGGER */}
                <div className="md:hidden">
                  <Sheet
                    open={mobileFilterOpen}
                    onOpenChange={setMobileFilterOpen}
                  >
                    <SheetTrigger asChild>
                      <Button variant="outline" className="h-10 text-sm">
                        <Filter className="mr-2 h-4 w-4" />
                        {t("filter_by_category")}
                      </Button>
                    </SheetTrigger>

                    <SheetContent
                      side="bottom"
                      className="max-h-[85vh] rounded-t-2xl px-5 pb-6"
                    >
                      <SheetHeader className="text-left">
                        <div className="flex items-center justify-between">
                          <SheetTitle>{t("filter_by_category")}</SheetTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              resetFilters();
                              setMobileFilterOpen(false);
                            }}
                            className="text-muted-foreground"
                          >
                            <RotateCcw className="mr-1 h-3.5 w-3.5" />
                            {t("reset_filter")}
                          </Button>
                        </div>
                      </SheetHeader>

                      <div className="mt-6 overflow-y-auto max-h-[60vh] space-y-6">
                        {/* CATEGORY */}
                        <div>
                          <h3 className="mb-4 text-sm font-semibold">{t("filter_by_category")}</h3>
                          <RadioGroup
                            value={category}
                            onValueChange={(val) => {
                              handleCategorySelect(val);
                              setMobileFilterOpen(false);
                            }}
                            className="space-y-1"
                          >
                            {categories.map((item) => {
                              const isSelected = category === item.name;
                              return (
                                <div
                                  key={item.name}
                                  className={`flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-muted ${
                                    isSelected ? "bg-muted/70 text-[#f51b25] font-semibold" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <RadioGroupItem
                                      value={item.name}
                                      id={`mobile-${item.name}`}
                                    />
                                    <Label
                                      htmlFor={`mobile-${item.name}`}
                                      className="cursor-pointer text-sm flex items-center gap-2"
                                    >
                                      {item.name === "All Products" ? t("all_products") : item.name}
                                    </Label>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {item.count}
                                  </span>
                                </div>
                              );
                            })}
                          </RadioGroup>
                        </div>

                        <Separator />

                        {/* PRICE RANGE */}
                        <div>
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold">{t("price_range")}</h3>
                            <span className="text-xs text-muted-foreground">
                              ৳{priceRange[0]} - ৳{priceRange[1]}
                            </span>
                          </div>

                          <Slider
                            value={priceRange}
                            onValueChange={(val) => {
                              setPriceRange(val);
                              setPagination((p) => ({ ...p, currentPage: 1 }));
                            }}
                            min={MIN_PRICE}
                            max={MAX_PRICE}
                            step={100}
                            className="mb-6"
                          />
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* SORT */}
                <div className="flex items-center gap-2">
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="h-10 w-[170px]">
                      <SelectValue placeholder={t("sort_by")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t("price_low_high")}</SelectItem>
                      <SelectItem value="high">{t("price_high_low")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* RESULTS HEADER */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <span>{category === "All Products" ? t("all_products") : category}</span>
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                About {pagination.total} results
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("showing_results")}: {products.length}
            </p>
          </div>

          <div className="relative min-h-[300px]">
            {/* SKELETON LOADER FOR PRODUCT LOADING */}
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-lg border bg-background shadow-sm"
                  >
                    <div className="aspect-square w-full bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-t-lg" />
                    <div className="p-2.5 space-y-2 mt-1">
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-4/5" />
                      <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-1/2" />
                      <div className="mt-2 flex items-center justify-between pt-1">
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-1/3" />
                        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              /* PRODUCT GRID */
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <div
                    key={product._id || product.id}
                    onClick={() =>
                      router.push(`/product/${product._id || product.slug}`)
                    }
                    className="
                      group
                      cursor-pointer
                      overflow-hidden
                      rounded-lg
                      border
                      bg-background
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:shadow-md
                    "
                  >
                    {/* IMAGE */}
                    <div className="overflow-hidden">
                      <img
                        src={
                          product.image ||
                          "/nodata.jpeg"
                        }
                        alt={product.name || product.title}
                        className="
                          aspect-square
                          w-full
                          object-cover
                          transition-transform
                          duration-300
                          group-hover:scale-[1.03]
                        "
                      />
                    </div>

                    {/* INFO */}
                    <div className="p-2.5">
                      <h3 className="line-clamp-2 min-h-[40px] text-xs font-medium leading-5 sm:text-sm">
                        {product.name || product.title}
                      </h3>

                      <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground sm:text-xs">
                        {product.category ||
                          product.description?.replace(/<[^>]*>?/gm, "") ||
                          ""}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm font-semibold sm:text-base">
                          ৳ {Number(product.price || 0).toLocaleString("en-BD")}
                        </p>

                        <span className="text-[10px] text-muted-foreground">
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed">
                <div className="text-center">
                  <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <h3 className="font-medium">No products found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try changing your filters or search.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 border-t pt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.currentPage > 1) {
                          setPagination((p) => ({
                            ...p,
                            currentPage: p.currentPage - 1,
                          }));
                        }
                      }}
                    />
                  </PaginationItem>

                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={pagination.currentPage === i + 1}
                        onClick={(e) => {
                          e.preventDefault();
                          setPagination((p) => ({
                            ...p,
                            currentPage: i + 1,
                          }));
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.currentPage < pagination.totalPages) {
                          setPagination((p) => ({
                            ...p,
                            currentPage: p.currentPage + 1,
                          }));
                        }
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="px-4 mt-8 md:px-8 pb-20">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-lg border bg-background"
              >
                <div className="aspect-square w-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <FilterPageContent />
    </Suspense>
  );
}