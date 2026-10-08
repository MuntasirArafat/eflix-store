"use client";

import React, { useEffect, useState } from "react";
import {
  Bold,
  Check,
  ChevronDown,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Save,
  Strikethrough,
  Underline,
  Upload,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

const defaultCategories = [
 "No Categories"
];

const brands = ["No Brand"];

export default function AddProductPage() {
  const router = useRouter();

  // Categories
  const [categories, setCategories] = useState(defaultCategories);

  // Product
  const [productName, setProductName] = useState("");
  const [slug, setSlug] = useState("");

  // Organization
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);


  const [isBrandOpen, setIsBrandOpen] = useState(false);

  // Inventory
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");

  // Pricing
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");

  // Status
  const [status, setStatus] = useState("Active");
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Options
  const [featured, setFeatured] = useState(false);
  const [showInMenu, setShowInMenu] = useState(true);

  // Dynamic Attributes
  const [attributes, setAttributes] = useState([]);

  const addAttribute = () => {
    setAttributes((prev) => [
      ...prev,
      {
        name: "",
        options: [{ label: "", price: "" }],
      },
    ]);
  };

  const removeAttribute = (attrIndex) => {
    setAttributes((prev) => prev.filter((_, i) => i !== attrIndex));
  };

  const updateAttributeName = (attrIndex, name) => {
    setAttributes((prev) =>
      prev.map((attr, i) => (i === attrIndex ? { ...attr, name } : attr))
    );
  };

  const addOption = (attrIndex) => {
    setAttributes((prev) =>
      prev.map((attr, i) =>
        i === attrIndex
          ? { ...attr, options: [...attr.options, { label: "", price: "" }] }
          : attr
      )
    );
  };

  const removeOption = (attrIndex, optIndex) => {
    setAttributes((prev) =>
      prev.map((attr, i) =>
        i === attrIndex
          ? { ...attr, options: attr.options.filter((_, j) => j !== optIndex) }
          : attr
      )
    );
  };

  const updateOption = (attrIndex, optIndex, field, value) => {
    setAttributes((prev) =>
      prev.map((attr, i) =>
        i === attrIndex
          ? {
              ...attr,
              options: attr.options.map((opt, j) =>
                j === optIndex ? { ...opt, [field]: value } : opt
              ),
            }
          : attr
      )
    );
  };

  // Image
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Saving
  const [isSaving, setIsSaving] = useState(false);

  // Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[280px] px-4 py-4 focus:outline-none text-sm text-[#e5e5e5]",
      },
    },
  });

  const handleNameChange = (e) => {
    const val = e.target.value;
    setProductName(val);
    if (!val.trim()) {
      setSlug("");
    } else {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
      );
    }
  };

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await axios.get("/api/admin/category");
        if (res.data.success && Array.isArray(res.data.data)) {
          const names = res.data.data.map((c) => c.name);
          if (names.length > 0) {
            setCategories(Array.from(new Set([...names, ...defaultCategories])));
          }
        }
      } catch (e) {
        console.error("Failed to load categories:", e);
      }
    }
    loadCategories();
  }, []);

  // Image upload to ImgBB
  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);
    setIsUploadingImage(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post("/api/admin/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success && res.data.url) {
        setProductImage(res.data.url);
        setImagePreview(res.data.url);
        toast.success("Image uploaded successfully");
      } else {
        throw new Error(res.data.message || "Failed to upload image to ImgBB.");
      }
    } catch (err) {
      console.error("ImgBB upload failed:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to upload image to ImgBB.";
      setUploadError(errMsg);
      toast.error(errMsg);
      setProductImage(null);
      setImagePreview("");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  const removeImage = () => {
    setProductImage(null);
    setImagePreview("");
    setUploadError("");
  };

  // Publish
  const handleSave = async () => {
    if (!productName.trim()) {
      toast.error("Please enter a product name.");
      return;
    }

    if (!category) {
      toast.error("Please select a category.");
      return;
    }

    if (!price || Number(price) < 0) {
      toast.error("Please enter a valid product price.");
      return;
    }

    if (!stock || Number(stock) < 0) {
      toast.error("Please enter a valid stock quantity.");
      return;
    }

    if (comparePrice && Number(comparePrice) < Number(price)) {
      toast.error(
        "Compare-at price should be greater than or equal to the selling price.",
      );
      return;
    }

    setIsSaving(true);

    try {
      const productData = {
        name: productName,
        slug,
        category,
        brand,
        sku,
        description: editor?.getHTML() || "",
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : null,
        stock: Number(stock),
        status,
        featured,
        showInMenu,
        image: typeof productImage === "string" ? productImage : imagePreview || "",
        attributes: attributes
          .filter((a) => a.name.trim())
          .map((a) => ({
            name: a.name.trim(),
            options: a.options
              .filter((o) => o.label.trim())
              .map((o) => ({
                label: o.label.trim(),
                price: o.price !== "" && o.price !== null ? Number(o.price) : null,
              })),
          })),
      };

      const res = await axios.post("/api/admin/products", productData);

      if (res.data.success) {
        toast.success("Product created successfully.");
        router.push("/admin/dashboard/products/list");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create product.");
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold mb-2">
              Add Product
            </h1>

            <p className="text-[#a3a3a3] text-xs sm:text-sm">
              Create a new product for your store.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="hidden lg:flex items-center justify-center gap-2 bg-white text-black text-sm font-medium px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}

            {isSaving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#353638] my-6 sm:my-8" />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
        {/* =========================================
            LEFT COLUMN
        ========================================== */}
        <div className="lg:col-span-2">
          {/* Product Name */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#e5e5e5] mb-2">
              Product Name
            </label>

            <input
              type="text"
              value={productName}
              onChange={handleNameChange}
              placeholder="Enter product name"
              className="w-full bg-[#353638] border border-[#444444] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#777777] focus:outline-none focus:border-[#666666] transition-colors"
            />
          </div>

          {/* Slug */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#e5e5e5] mb-2">
              Slug
            </label>

            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="product-slug"
              className="w-full bg-[#353638] border border-[#444444] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#777777] focus:outline-none focus:border-[#666666] transition-colors"
            />

            <p className="text-[#777777] text-xs mt-2">
              The slug is generated automatically from the product name.
            </p>
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#e5e5e5] mb-2">
              Description
            </label>

            <div className="bg-[#353638] border border-[#444444] rounded-xl overflow-hidden">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[#444444]">
                {/* Bold */}
                <button
                  type="button"
                  title="Bold"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive("bold")
                      ? "bg-[#444444] text-white"
                      : "text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white"
                  }`}
                >
                  <Bold className="w-4 h-4" />
                </button>

                {/* Italic */}
                <button
                  type="button"
                  title="Italic"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive("italic")
                      ? "bg-[#444444] text-white"
                      : "text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white"
                  }`}
                >
                  <Italic className="w-4 h-4" />
                </button>

                {/* Underline */}
                <button
                  type="button"
                  title="Underline"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    editor?.chain().focus().toggleUnderline().run()
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive("underline")
                      ? "bg-[#444444] text-white"
                      : "text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white"
                  }`}
                >
                  <Underline className="w-4 h-4" />
                </button>

                {/* Strike */}
                <button
                  type="button"
                  title="Strikethrough"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive("strike")
                      ? "bg-[#444444] text-white"
                      : "text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white"
                  }`}
                >
                  <Strikethrough className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-[#444444] mx-1" />

                {/* Bullet List */}
                <button
                  type="button"
                  title="Bullet List"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    editor?.chain().focus().toggleBulletList().run()
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive("bulletList")
                      ? "bg-[#444444] text-white"
                      : "text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>

                {/* Ordered List */}
                <button
                  type="button"
                  title="Numbered List"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    editor?.chain().focus().toggleOrderedList().run()
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive("orderedList")
                      ? "bg-[#444444] text-white"
                      : "text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white"
                  }`}
                >
                  <ListOrdered className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-[#444444] mx-1" />

                {/* Link */}
                <button
                  type="button"
                  title="Add Link"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const url = window.prompt("Enter URL", "https://");

                    if (!url) return;

                    editor
                      ?.chain()
                      .focus()
                      .setLink({
                        href: url,
                      })
                      .run();
                  }}
                  className="p-2 rounded-lg text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Editor */}
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#e5e5e5] mb-2">
              Pricing
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Price */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777777] text-sm">
                  ৳
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price"
                  className="w-full bg-[#353638] border border-[#444444] rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder:text-[#777777] focus:outline-none focus:border-[#666666] transition-colors"
                />
              </div>

              {/* Compare Price */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777777] text-sm">
                  ৳
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  placeholder="Compare-at Price"
                  className="w-full bg-[#353638] border border-[#444444] rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder:text-[#777777] focus:outline-none focus:border-[#666666] transition-colors"
                />
              </div>
            </div>

            <p className="text-[#777777] text-xs mt-2">
              Compare-at price is the original price shown when the product is
              discounted.
            </p>
          </div>

          {/* Inventory */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#e5e5e5] mb-2">
              Inventory
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* SKU */}
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU"
                className="w-full bg-[#353638] border border-[#444444] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#777777] focus:outline-none focus:border-[#666666] transition-colors"
              />

              {/* Stock */}
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Stock Quantity"
                className="w-full bg-[#353638] border border-[#444444] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#777777] focus:outline-none focus:border-[#666666] transition-colors"
              />
            </div>
          </div>

          {/* Attributes System */}
          <div className="mb-6 rounded-2xl border border-[#444444] bg-[#2d2e30] p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#e5e5e5] flex items-center gap-2">
                  Product Attributes
                  <span className="text-[11px] font-normal text-[#888888] bg-[#3a3b3e] px-2 py-0.5 rounded-full">
                    {attributes.length} {attributes.length === 1 ? "Attribute" : "Attributes"}
                  </span>
                </h3>
                <p className="text-xs text-[#888888] mt-1">
                  Add dynamic attributes such as Duration, Devices / Screens, Size, Color, or Plan options.
                </p>
              </div>

              <button
                type="button"
                onClick={addAttribute}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white text-black hover:bg-neutral-200 px-3.5 py-2 text-xs font-semibold transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Attribute
              </button>
            </div>

            {attributes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#444444] bg-[#353638]/50 p-6 text-center">
                <p className="text-xs text-[#888888]">
                  No attributes added yet. Click &quot;Add Attribute&quot; if this product requires custom options like Duration or Screens.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {attributes.map((attr, attrIdx) => (
                  <div
                    key={attrIdx}
                    className="rounded-xl border border-[#444444] bg-[#353638] p-4 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1">
                        <label className="block text-[11px] font-medium text-[#a3a3a3] uppercase tracking-wider mb-1">
                          Attribute Name
                        </label>
                        <input
                          type="text"
                          value={attr.name}
                          onChange={(e) => updateAttributeName(attrIdx, e.target.value)}
                          placeholder="e.g. Duration, Devices / Screens, Size, Plan"
                          className="w-full bg-[#292a2d] border border-[#4a4b4e] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#666666] focus:outline-none focus:border-[#777777]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeAttribute(attrIdx)}
                        className="mt-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Remove Attribute"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Options */}
                    <div>
                      <label className="block text-[11px] font-medium text-[#a3a3a3] uppercase tracking-wider mb-2">
                        Options &amp; Values
                      </label>

                      <div className="space-y-2">
                        {attr.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={opt.label}
                              onChange={(e) =>
                                updateOption(attrIdx, optIdx, "label", e.target.value)
                              }
                              placeholder="Option Label (e.g. 1 Month, 1 Screen)"
                              className="flex-1 bg-[#292a2d] border border-[#4a4b4e] rounded-lg px-3 py-2 text-xs sm:text-sm text-white placeholder:text-[#666666] focus:outline-none focus:border-[#777777]"
                            />

                            <input
                              type="number"
                              min="0"
                              value={opt.price}
                              onChange={(e) =>
                                updateOption(attrIdx, optIdx, "price", e.target.value)
                              }
                              placeholder="Price ৳ (optional)"
                              className="w-32 sm:w-36 bg-[#292a2d] border border-[#4a4b4e] rounded-lg px-3 py-2 text-xs sm:text-sm text-white placeholder:text-[#666666] focus:outline-none focus:border-[#777777]"
                            />

                            {attr.options.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeOption(attrIdx, optIdx)}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#888888] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addOption(attrIdx)}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Option
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* =========================================
            RIGHT COLUMN
        ========================================== */}
        <div>
          {/* Product Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#e5e5e5] mb-2">
              Product Image
            </label>

            {!imagePreview ? (
              <label className="relative flex flex-col items-center justify-center w-full h-[280px] bg-[#353638] border border-dashed border-[#555555] rounded-xl cursor-pointer hover:bg-[#3b3c3e] transition-colors">
                <ImageIcon className="w-8 h-8 text-[#777777] mb-3" />

                <p className="text-sm text-[#e5e5e5] mb-1">
                  Upload product image
                </p>

                <p className="text-xs text-[#777777]">
                  PNG, JPG or WEBP up to 10MB • Uploads to ImgBB
                </p>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <div className="bg-[#353638] rounded-xl overflow-hidden border border-[#444444] relative">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-[280px] object-cover"
                  />

                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 p-4 text-center z-10">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                      <p className="text-xs font-semibold text-white">
                        Uploading to ImgBB...
                      </p>
                      <p className="text-[11px] text-[#a3a3a3]">
                        Storing on cloud server
                      </p>
                    </div>
                  )}

                  {!isUploadingImage && productImage?.startsWith("http") && (
                    <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5 z-10">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-medium text-emerald-300">
                        ImgBB Hosted
                      </span>
                    </div>
                  )}
                </div>

                {!isUploadingImage && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 bg-black/70 rounded-full text-white hover:bg-black transition-colors z-20"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {uploadError && (
              <p className="text-red-400 text-xs mt-2">{uploadError}</p>
            )}

            <p className="text-[#777777] text-xs mt-2">
              Recommended square image. Hosted on ImgBB.
            </p>
          </div>

          {/* Category */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#e5e5e5] mb-2">
              Category
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full flex items-center justify-between gap-3 bg-[#353638] border border-[#444444] rounded-xl px-4 py-3 text-sm text-left hover:border-[#666666] transition-colors"
              >
                <span className={category ? "text-white" : "text-[#777777]"}>
                  {category || "Select category"}
                </span>

                <ChevronDown
                  className={`w-4 h-4 text-[#a3a3a3] transition-transform ${
                    isCategoryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isCategoryOpen && (
                <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#353638] border border-[#444444] rounded-xl shadow-lg py-2 z-30">
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setCategory(item);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-[#3d3e40] transition-colors ${
                        category === item
                          ? "text-white bg-[#3d3e40]"
                          : "text-[#e5e5e5]"
                      }`}
                    >
                      <span>{item}</span>

                      {category === item && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Brand */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#e5e5e5] mb-2">
              Brand
              <span className="text-[#777777] font-normal ml-1">
                (Optional)
              </span>
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsBrandOpen(!isBrandOpen)}
                className="w-full flex items-center justify-between gap-3 bg-[#353638] border border-[#444444] rounded-xl px-4 py-3 text-sm text-left hover:border-[#666666] transition-colors"
              >
                <span className={brand ? "text-white" : "text-[#777777]"}>
                  {brand || "Select brand"}
                </span>

                <ChevronDown
                  className={`w-4 h-4 text-[#a3a3a3] transition-transform ${
                    isBrandOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isBrandOpen && (
                <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#353638] border border-[#444444] rounded-xl shadow-lg py-2 z-30">
                  {brands.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setBrand(item);
                        setIsBrandOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-[#3d3e40] transition-colors ${
                        brand === item
                          ? "text-white bg-[#3d3e40]"
                          : "text-[#e5e5e5]"
                      }`}
                    >
                      <span>{item}</span>

                      {brand === item && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#e5e5e5] mb-2">
              Status
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="w-full flex items-center justify-between gap-3 bg-[#353638] border border-[#444444] rounded-xl px-4 py-3 text-sm text-left hover:border-[#666666] transition-colors"
              >
                <span className="text-white">{status}</span>

                <ChevronDown
                  className={`w-4 h-4 text-[#a3a3a3] transition-transform ${
                    isStatusOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isStatusOpen && (
                <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#353638] border border-[#444444] rounded-xl shadow-lg py-2 z-30">
                  {["Active", "Inactive"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setStatus(item);
                        setIsStatusOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-[#3d3e40] transition-colors ${
                        status === item
                          ? "text-white bg-[#3d3e40]"
                          : "text-[#e5e5e5]"
                      }`}
                    >
                      <span>{item}</span>

                      {status === item && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center justify-between gap-4 py-3 border-t border-[#353638]">
            <div>
              <p className="text-sm text-[#e5e5e5]">Featured Product</p>

              <p className="text-xs text-[#777777] mt-1">
                Highlight this product in featured sections.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFeatured(!featured)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                featured ? "bg-white" : "bg-[#555555]"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                  featured ? "left-6 bg-black" : "left-1 bg-[#a3a3a3]"
                }`}
              />
            </button>
          </div>

          {/* Show
          <div className="flex items-center justify-between gap-4 py-3 border-t border-[#353638]">
            <div>
              <p className="text-sm text-[#e5e5e5]">Top Product</p>

              <p className="text-xs text-[#777777] mt-1">
                Make this product visible in the store top products section.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowInMenu(!showInMenu)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                showInMenu ? "bg-white" : "bg-[#555555]"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                  showInMenu ? "left-6 bg-black" : "left-1 bg-[#a3a3a3]"
                }`}
              />
            </button>
          </div>

           in Menu */}
        </div>
      </div>

      {/* Bottom Divider */}
      <div className="w-full h-px bg-[#353638] my-6 sm:my-8" />

      {/* Bottom Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full sm:w-auto text-sm font-medium px-5 py-2.5 rounded-full border border-[#444444] text-[#e5e5e5] hover:bg-[#353638] transition-colors"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex justify-center items-center sm:w-auto bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}

            {isSaving ? "Saving..." : "Publish"}
        </button>
      </div>
    </div>
  );
}
