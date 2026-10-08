"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useLanguage } from "@/context/LanguageContext";

const initialCart = [
  {
    id: 1,
    name: "Classic T-Shirt",
    price: 29,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Everyday Sneakers",
    price: 89,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop",
  },
];

export default function Navbar() {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Separate cart states
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [desktopCartOpen, setDesktopCartOpen] = useState(false);

  const [cartItems, setCartItems] = useState(initialCart);

  // Language modal state
  const [languageOpen, setLanguageOpen] = useState(false);

  // Always enforce dark mode across the entire app
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // ============================================================
  // CART FUNCTIONS
  // ============================================================

  const increaseQuantity = (id) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const cartSubtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // ============================================================
  // CART CLOSE
  // ============================================================

  const closeCart = () => {
    setMobileCartOpen(false);
    setDesktopCartOpen(false);
  };

  // ============================================================
  // CART CONTENT
  // ============================================================

  const renderCartContent = () => (
    <>
      <SheetHeader className="border-b border-gray-200 px-5 py-5 text-left dark:border-gray-800">
        <div className="pr-8">
          <SheetTitle className="text-lg font-semibold">
            Shopping Cart
          </SheetTitle>

          <SheetDescription className="mt-1">
            {cartCount === 0
              ? "Your cart is empty"
              : `${cartCount} ${
                  cartCount === 1 ? "item" : "items"
                } in your cart`}
          </SheetDescription>
        </div>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col">
        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
              <ShoppingCart
                className="h-7 w-7 text-gray-400"
                strokeWidth={1.5}
              />
            </div>

            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Your cart is empty
            </h3>

            <p className="mt-2 max-w-xs text-sm text-gray-500">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
          </div>
        ) : (
          <>
            {/* CART ITEMS */}

            <div className="flex-1 overflow-y-auto px-5">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 py-5">
                    {/* IMAGE */}

                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* CONTENT */}

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* REMOVE */}

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="shrink-0 rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                        </button>
                      </div>

                      {/* QUANTITY */}

                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-800">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.id)}
                            aria-label="Decrease quantity"
                            className="flex h-8 w-8 items-center justify-center text-gray-500 transition hover:bg-gray-100 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white"
                          >
                            <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                          </button>

                          <span className="flex h-8 min-w-8 items-center justify-center border-x border-gray-200 px-2 text-xs font-medium dark:border-gray-800">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.id)}
                            aria-label="Increase quantity"
                            className="flex h-8 w-8 items-center justify-center text-gray-500 transition hover:bg-gray-100 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white"
                          >
                            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                          </button>
                        </div>

                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER */}

            <div className="border-t border-gray-200 bg-white px-5 pb-5 pt-4 dark:border-gray-800 dark:bg-gray-950">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Subtotal</span>

                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  ${cartSubtotal.toFixed(2)}
                </span>
              </div>

              <p className="mt-1 text-xs text-gray-400">
                Shipping and taxes calculated at checkout.
              </p>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                Proceed to checkout
              </Link>

              <button
                type="button"
                onClick={closeCart}
                className="mt-3 flex h-10 w-full items-center justify-center text-sm font-medium text-gray-600 transition hover:text-black dark:text-gray-400 dark:hover:text-white"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* ========================================================
          NAVBAR
      ========================================================= */}

      <header className="sticky top-0 z-40 w-full  bg-white/90 backdrop-blur-xl  dark:bg-[#171717] border-b dark:border-black shadow-md">
        <nav className="relative mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
          {/* ==================================================
              MOBILE MENU BUTTON
          ================================================== */}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="rounded-full p-2.5 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black md:hidden dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <Menu className="h-6 w-6" strokeWidth={1.8} />
          </button>

          {/* ==================================================
              LOGO
              
              Mobile = absolute center
              Desktop = normal left
          ================================================== */}

          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-gray-950 dark:text-white"
          >
            {/* MOBILE

            <span className="absolute text-[#ED1C25] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden" >
              EFLIX
            </span>

             LOGO */}

            <img
              src="/logo.png"
              className="absolute text-[#ED1C25] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden"
              width={120}
            />

            {/* DESKTOP

            <span className="hidden md:block  text-[#ED1C25]">EFLIX</span>

             LOGO */}

            <img
              src="/logo.png"
              className="hidden md:block  text-[#ED1C25]"
              width={120}
            />
          </Link>

          {/* ==================================================
              DESKTOP NAV
          ================================================== */}

          <div className="ml-8 hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/filter"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white"
            >
              Shop
            </Link>

            <Link
              href="/filter?category=Streaming"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white"
            >
              Streaming
            </Link>

            <Link
              href="/filter?category=AI+%26+Tools"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white"
            >
              AI & Tools
            </Link>

            <Link
              href="/filter?category=Gaming+%26+Music"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white"
            >
              Gaming & Music
            </Link>
          </div>

          {/* ==================================================
              RIGHT SIDE
          ================================================== */}

          <div className="ml-auto flex items-center gap-1">
            {/* ==================================================
                DESKTOP SEARCH
            ================================================== */}

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="hidden h-10 w-64 items-center gap-3 rounded-lg border border-gray-200 px-3 text-left transition hover:border-gray-300 md:flex dark:border-[#2e2e2e]  dark:hover:border-gray-700"
            >
              <Search
                className="h-4 w-4 shrink-0 text-gray-400"
                strokeWidth={1.8}
              />

              <span className="text-sm text-gray-400">Search products...</span>

              <kbd className="ml-auto rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-400 dark:border-[#2e2e2e] dark:bg-[#2e2e2e]">
                ⌘ K
              </kbd>
            </button>

            {/* ==================================================
                MOBILE SEARCH
            ================================================== */}

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="rounded-full p-2.5 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black md:hidden dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <Search className="h-5 w-5" strokeWidth={1.8} />
            </button>

            {/* ==================================================
                LANGUAGE SWITCHER
            ================================================== */}

            <button
              type="button"
              onClick={() => setLanguageOpen(true)}
              aria-label="Select language"
              className="flex items-center gap-1.5 rounded-lg p-2 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <span className="text-base leading-none">
                {lang === "bn" ? (
                  <img
                    src="/bd.svg"
                    alt="Bangla"
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <img
                    src="/gb.svg"
                    alt="English"
                    className="h-5 w-5 rounded-full object-cover"
                  />
                )}
              </span>

              <span className="hidden text-xs font-semibold sm:inline">
                {lang === "bn" ? "বাংলা" : "English"}
              </span>
            </button>

            {/* ====================*/}
          </div>
        </nav>
      </header>

      {/* ========================================================
          MOBILE LEFT SIDEBAR
          
          NO CART HERE
      ========================================================= */}

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          className="flex w-[85%] max-w-sm flex-col gap-0 p-0"
        >
          {/* SIDEBAR HEADER */}

          <SheetHeader className="border-b border-gray-200 px-5 py-5 text-left dark:border-gray-800">
            <div className="pr-8">
              <SheetTitle className="text-xl text-[#ED1C25]  font-bold tracking-tight">
                EFLIX
              </SheetTitle>
            </div>
          </SheetHeader>

          {/* NAVIGATION */}

          <div className="flex flex-1 flex-col overflow-y-auto px-4 py-5">
            <div className="space-y-1">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/filter"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
              >
                Shop
              </Link>

              <Link
                href="/filter?category=Streaming"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
              >
                Streaming
              </Link>

              <Link
                href="/filter?category=AI+%26+Tools"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
              >
                AI & Tools
              </Link>

              <Link
                href="/filter?category=Gaming+%26+Music"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
              >
                Gaming & Music
              </Link>
            </div>

            {/* DIVIDER */}

            <div className="my-5 border-t border-gray-200 dark:border-gray-800" />

            {/* LANGUAGE (MOBILE) */}

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setLanguageOpen(true);
              }}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-3 text-sm font-medium dark:border-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
            >
              <span className="flex items-center gap-3">
                {lang === "bn" ? (
                  <img
                    src="/bd.svg"
                    alt="Bangla"
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <img
                    src="/gb.svg"
                    alt="English"
                    className="h-5 w-5 rounded-full object-cover"
                  />
                )}

                <span>{t("language")}</span>
              </span>

              <span className="text-xs font-semibold text-gray-400">
                {lang === "bn" ? "বাংলা" : "English"}
              </span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ========================================================
          SEARCH DIALOG
      ========================================================= */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Search products</DialogTitle>
          </DialogHeader>

          <div className="flex items-center border-b border-gray-200 px-4 dark:border-gray-800">
            <Search
              className="h-5 w-5 shrink-0 text-gray-400"
              strokeWidth={1.8}
            />

            <input
              autoFocus
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  setSearchOpen(false);
                  router.push(
                    `/filter?search=${encodeURIComponent(searchQuery.trim())}`,
                  );
                }
              }}
              placeholder="Search products..."
              className="h-16 flex-1 bg-transparent px-4 text-base outline-none placeholder:text-gray-400 dark:text-white"
            />
          </div>

          <div className="px-5 py-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-gray-400">
              Popular searches
            </p>

            <div className="flex flex-wrap gap-2">
              {["Netflix", "Primevideo", "Chatgpt", "iTunes", "Drive"].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      router.push(`/filter?search=${encodeURIComponent(item)}`);
                    }}
                    className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:border-gray-400 hover:text-black dark:border-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-white"
                  >
                    {item}
                  </button>
                ),
              )}
            </div>

            <p className="mt-8 text-center text-xs text-gray-400">
              Press{" "}
              <kbd className="rounded border border-gray-300 px-1.5 py-0.5 dark:border-gray-700">
                ESC
              </kbd>{" "}
              to close
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================
          MOBILE CART
          
          Opens from mobile cart icon
          Bottom sheet
      ========================================================= */}

      <div className="md:hidden">
        <Sheet open={mobileCartOpen} onOpenChange={setMobileCartOpen}>
          <SheetContent
            side="bottom"
            className="flex h-[85vh] flex-col gap-0 rounded-t-2xl border-x-0 border-b-0 p-0"
          >
            {renderCartContent()}
          </SheetContent>
        </Sheet>
      </div>

      {/* ========================================================
          DESKTOP CART
          
          Opens from desktop cart icon
          Right sheet
      ========================================================= */}

      <div className="hidden md:block">
        <Sheet open={desktopCartOpen} onOpenChange={setDesktopCartOpen}>
          <SheetContent
            side="right"
            className="flex h-full w-full max-w-md flex-col gap-0 p-0"
          >
            {renderCartContent()}
          </SheetContent>
        </Sheet>

        {/* ==================================================
          LANGUAGE MODAL
      ================================================== */}

        <Dialog open={languageOpen} onOpenChange={setLanguageOpen}>
          <DialogContent className="max-w-sm border-neutral-800 bg-[#161616] text-white">
            <DialogHeader>
              <DialogTitle className="text-white text-base font-semibold">
                {t("select_language")}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-2.5">
              {/* English */}
              <button
                type="button"
                onClick={() => {
                  setLang("en");
                  setLanguageOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl border p-3.5 transition ${
                  lang === "en"
                    ? "border-[#f51b25] bg-[#f51b25]/10 text-white"
                    : "border-neutral-800 hover:bg-neutral-900 text-neutral-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src="/gb.svg"
                    alt="English"
                    className="h-6 w-6 rounded-full object-cover"
                  />

                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">English</p>
                    <p className="text-xs text-neutral-400">English (EN)</p>
                  </div>
                </div>

                {lang === "en" && (
                  <img
                    src="/check.webp"
                    alt="Selected"
                    className="w-6 rounded-full"
                  />
                )}
              </button>

              {/* Bangla */}
              <button
                type="button"
                onClick={() => {
                  setLang("bn");
                  setLanguageOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl border p-3.5 transition ${
                  lang === "bn"
                    ? "border-[#f51b25] bg-[#f51b25]/10 text-white"
                    : "border-neutral-800 hover:bg-neutral-900 text-neutral-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src="/bd.svg"
                    alt="Bangla"
                    className="h-6 w-6 rounded-full object-cover"
                  />

                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">
                      বাংলা (Bangla)
                    </p>
                    <p className="text-xs text-neutral-400">বাংলাদেশ (BN)</p>
                  </div>
                </div>

                {lang === "bn" && (
                  <img
                    src="/check.webp"
                    alt="Selected"
                    className="w-6 rounded-full"
                  />
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
