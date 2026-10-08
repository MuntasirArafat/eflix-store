"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Placeholder from "@tiptap/extension-placeholder";
import {
  ArrowLeft,
  Package,
  UserRound,
  Mail,
  CreditCard,
  CalendarDays,
  Truck,
  Clock3,
  CheckCircle2,
  Send,
  ShieldCheck,
  FileText,
  Save,
  Loader2,
  AlertCircle,
  Copy,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Code,
} from "lucide-react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { generateDigitalDeliveryEmail } from "@/lib/emailTemplates";


const statuses = [
  "Pending",
  "Processing",
  "Delivered",
  "Cancelled",
];

const paymentStatuses = ["Pending", "Paid", "Unpaid"];

const inputClass =
  "w-full rounded-lg border border-[#444444] bg-[#292a2d] px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/40";

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "-";
  }
}


function getStatusStyle(status) {
  switch (status) {
    case "Paid":
    case "Delivered":
      return "bg-green-500/10 text-green-400 border-green-500/20";

    case "Processing":
  
    case "Pending":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

    case "Unpaid":
    case "Cancelled":
      return "bg-red-500/10 text-red-400 border-red-500/20";

    default:
      return "bg-white/5 text-gray-300 border-white/10";
  }
}

function Badge({ children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyle(
        children
      )}`}
    >
      {children}
    </span>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl border border-[#3b3c3f] bg-[#252628]">
      <div className="flex items-center gap-3 border-b border-[#3b3c3f] px-5 py-4">
        <Icon className="h-5 w-5 text-gray-300" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>

      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, children }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#3b3c3f] py-3 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      {children || <span className="text-sm text-white">{value}</span>}
    </div>
  );
}

function ToolbarButton({ editor, onClick, active, title, children }) {
  if (!editor) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
        active
          ? "bg-white text-black"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-[#3b3c3f] ${className}`} />;
}

function OrderDetailsSkeleton() {
  return (
    <div className="w-full" aria-busy="true" aria-label="Loading order">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-8 w-40" />
          <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>
        <SkeletonBlock className="mt-2 h-4 w-64" />
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#3b3c3f] bg-[#252628] p-5"
          >
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-3 h-6 w-32" />
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {[4, 5, 8].map((rows, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#3b3c3f] bg-[#252628]"
            >
              <div className="flex items-center gap-3 border-b border-[#3b3c3f] px-5 py-4">
                <SkeletonBlock className="h-5 w-5 rounded-full" />
                <SkeletonBlock className="h-4 w-40" />
              </div>
              <div className="space-y-4 p-5">
                {Array.from({ length: rows }).map((_, r) => (
                  <div key={r} className="flex items-center justify-between gap-4">
                    <SkeletonBlock className="h-4 w-28" />
                    <SkeletonBlock className="h-4 w-40" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {[3, 5].map((rows, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#3b3c3f] bg-[#252628]"
            >
              <div className="flex items-center gap-3 border-b border-[#3b3c3f] px-5 py-4">
                <SkeletonBlock className="h-5 w-5 rounded-full" />
                <SkeletonBlock className="h-4 w-32" />
              </div>
              <div className="space-y-4 p-5">
                {Array.from({ length: rows }).map((_, r) => (
                  <SkeletonBlock key={r} className="h-9 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  // "loading" until the request settles; "notFound" only after it truly failed
  const [fetchStatus, setFetchStatus] = useState("loading");
  const pendingNotesRef = useRef(null);

  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const [savingStatus, setSavingStatus] = useState(false);

  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState("Pending");
  const [savingPaymentStatus, setSavingPaymentStatus] = useState(false);

  const [sendingEmail, setSendingEmail] = useState(false);

  const [notice, setNotice] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [trxCopied, setTrxCopied] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [inlineEmailNotice, setInlineEmailNotice] = useState("");
  const [inlineEmailError, setInlineEmailError] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
      placeholder: "Type here...",
     }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[350px] px-4 py-4 focus:outline-none text-sm text-[#e5e5e5]",
      },
    },
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchOrder() {
      if (!params?.id) return;
      setFetchStatus("loading");
      try {
        const response = await axios.get(`/api/admin/orders/${params.id}`);
        if (!isMounted) return;

        if (!response.data?.success || !response.data?.data) {
          setFetchStatus("notFound");
          return;
        }

        const ord = response.data.data;
        const extractedTrx =
          ord.transactionId ||
          (ord.deliveryNotes?.match(/TrxID:\s*([^\s<]+)/i)?.[1] ||
            (typeof ord.deliveryNotes === "string" &&
            ord.deliveryNotes.trim().startsWith("TrxID:")
              ? ord.deliveryNotes.replace(/^TrxID:\s*/i, "").trim()
              : ""));

        const normalizedOrder = {
          ...ord,
          transactionId: extractedTrx || ord.transactionId || "",
        };

        setOrder(normalizedOrder);
        setSelectedStatus(ord.status || "Pending");
        setSelectedPaymentStatus(ord.paymentStatus || "Pending");
        setEmailSubject(
          `Your Digital Product Credentials - Order #${ord.orderNumber}`
        );

        const isOnlyTrxNote =
          ord.deliveryNotes &&
          (ord.deliveryNotes.trim().startsWith("TrxID:") ||
            ord.deliveryNotes.trim().startsWith("<p>TrxID:"));

        if (ord.deliveryNotes && !isOnlyTrxNote) {
          pendingNotesRef.current = ord.deliveryNotes;
        }

        setFetchStatus("ready");
      } catch (err) {
        console.error("Order fetch error:", err);
        if (isMounted) setFetchStatus("notFound");
      }
    }
    fetchOrder();
    return () => {
      isMounted = false;
    };
  }, [params?.id]);

  // Load saved delivery notes into the editor once both are available
  useEffect(() => {
    if (editor && order && pendingNotesRef.current) {
      editor.commands.setContent(pendingNotesRef.current);
      pendingNotesRef.current = null;
    }
  }, [editor, order]);

  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  if (fetchStatus === "loading" || (fetchStatus === "ready" && !order)) {
    return <OrderDetailsSkeleton />;
  }

  if (fetchStatus === "notFound" || !order) {
    return (
      <div className="w-full text-white">
        <div className="rounded-xl border border-[#3b3c3f] bg-[#252628] p-8 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-400" />
          <p className="text-sm text-gray-300">Order not found.</p>
          <button
            onClick={() => router.push("/admin/dashboard/orders/list")}
            className="mt-5 rounded-lg border border-[#444444] px-4 py-2 text-sm text-white hover:bg-white/5"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const products =
    order.products && order.products.length > 0
      ? order.products
      : [
          {
            id: "default",
            name: "Digital Subscription",
            quantity: order.items || 1,
            price: order.total || 0,
            deliveryType: "Digital",
          },
        ];

  async function handleStatusUpdate() {
    try {
      setSavingStatus(true);
      setNotice("");

      const id = order._id || order.id || order.orderNumber;
      const res = await axios.put(`/api/admin/orders/${id}`, {
        status: selectedStatus,
      });

      if (res.data.success) {
        setOrder((current) => ({
          ...current,
          status: selectedStatus,
        }));
        setNotice("Order status updated successfully.");
        toast.success(`Order status updated to ${selectedStatus}`);
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to update order status.";
      setNotice(errMsg);
      toast.error(errMsg);
    } finally {
      setSavingStatus(false);
    }
  }

  async function handlePaymentStatusUpdate() {
    try {
      setSavingPaymentStatus(true);
      setNotice("");

      const id = order._id || order.id || order.orderNumber;
      const res = await axios.put(`/api/admin/orders/${id}`, {
        paymentStatus: selectedPaymentStatus,
      });

      if (res.data.success) {
        setOrder((current) => ({
          ...current,
          paymentStatus: selectedPaymentStatus,
        }));
        setNotice("Payment status updated successfully.");
        toast.success(`Payment status updated to ${selectedPaymentStatus}`);
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to update payment status.";
      setNotice(errMsg);
      toast.error(errMsg);
    } finally {
      setSavingPaymentStatus(false);
    }
  }

  async function copyTrxId(trx) {
    if (!trx) return;
    try {
      await navigator.clipboard.writeText(trx);
      setTrxCopied(true);
      setTimeout(() => setTrxCopied(false), 2000);
      toast.success("TrxID copied to clipboard.");
    } catch {
      setNotice("Unable to copy TrxID.");
      toast.error("Unable to copy TrxID.");
    }
  }

  async function handleSendEmail() {
    if (!editor) return;

    const message = editor.getText().trim();
    const rawHtml = editor.getHTML();

    if (!message) {
      const msg = "Please enter digital product information before sending.";
      setInlineEmailError(msg);
      toast.error(msg);
      return;
    }

    if (!order?.email) {
      const msg = "Customer does not have a valid email address.";
      setInlineEmailError(msg);
      toast.error(msg);
      return;
    }

    try {
      setSendingEmail(true);
      setInlineEmailNotice("");
      setInlineEmailError("");
      setNotice("");
      setEmailSent(false);

      const id = order._id || order.id || order.orderNumber;
      const finalSubject =
        emailSubject.trim() || `Your Digital Product - Order #${order.orderNumber}`;

      const formattedEmailHtml = generateDigitalDeliveryEmail(order, rawHtml);

      await Promise.all([
        axios.post("/api/admin/email", {
          type: "email",
          recipientType: "specific_email",
          recipients: [order.email],
          subject: finalSubject,
          html: formattedEmailHtml,
          message,
        }),
        axios.put(`/api/admin/orders/${id}`, {
          deliveryNotes: rawHtml,
        }),
      ]);

      setEmailSent(true);
      const successMsg = `Email dispatched to ${order.email} successfully!`;
      setInlineEmailNotice(successMsg);
      setNotice(successMsg);
      toast.success(successMsg);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to send digital product information.";
      setInlineEmailError(errorMsg);
      setNotice(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSendingEmail(false);
    }
  }


  async function copyCustomerEmail() {
    try {
      await navigator.clipboard.writeText(order.email);
      setNotice("Customer email copied.");
      toast.success("Customer email copied.");
    } catch {
      setNotice("Unable to copy customer email.");
      toast.error("Unable to copy customer email.");
    }
  }

  function handleAddLink() {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  }

  function handleAddImage() {
    if (!editor) return;

    const url = window.prompt("Enter image URL");

    if (!url) return;

    editor
      .chain()
      .focus()
      .setImage({
        src: url,
      })
      .run();
  }

  return (
    <div className="w-full">
      <div>
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-white">
                #{order.orderNumber}
              </h1>
            </div>

            <p className="mt-1 text-sm text-gray-400">
              Order details and fulfillment information
            </p>
          </div>
        </div>

        {/* Notification */}
        {(notice || emailSent) && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
              emailSent
                ? "border-green-500/20 bg-green-500/10 text-green-400"
                : notice.includes("successfully") || notice.includes("copied")
                ? "border-green-500/20 bg-green-500/10 text-green-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {notice.includes("successfully") || notice.includes("copied") ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}

            <span>{notice}</span>
          </div>
        )}

        {/* Overview Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#3b3c3f] bg-[#252628] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">Order Total</span>
              <CreditCard className="h-5 w-5 text-gray-500" />
            </div>
            <p className="text-2xl font-semibold text-white">
              {formatPrice(order.total)}
            </p>
          </div>

          <div className="rounded-xl border border-[#3b3c3f] bg-[#252628] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">Order Date</span>
              <CalendarDays className="h-5 w-5 text-gray-500" />
            </div>
            <p className="text-sm font-medium text-white">
              {formatDate(order.orderDate || order.createdAt)}
            </p>
          </div>

          <div className="rounded-xl border border-[#3b3c3f] bg-[#252628] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">Payment Status</span>
              <CreditCard className="h-5 w-5 text-gray-500" />
            </div>
            <Badge>{order.paymentStatus}</Badge>
          </div>

          <div className="rounded-xl border border-[#3b3c3f] bg-[#252628] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">Fulfillment Status</span>
              <Truck className="h-5 w-5 text-gray-500" />
            </div>
            <Badge>{order.status}</Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left */}
          <div className="space-y-6 lg:col-span-2">
            {/* Customer Information */}
            <SectionCard title="Customer Information" icon={UserRound}>
              <div className="space-y-1">
                <InfoRow label="Name" value={order.customerName || order.customer} />
                {order.phone && <InfoRow label="Phone" value={order.phone} />}


                <InfoRow label="Email">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">{order.email}</span>

                    <button
                      type="button"
                      onClick={copyCustomerEmail}
                      className="rounded-md p-1.5 text-gray-400 transition hover:bg-white/5 hover:text-white"
                      title="Copy email"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </InfoRow>
              </div>
            </SectionCard>

            {/* Order Information */}
            <SectionCard title="Order Information" icon={Package}>
              <div className="space-y-4">
                {products.map((product, index) => (
                  <div
                    key={product._id || product.id || `${product.name || 'item'}-${index}`}
                    className="rounded-lg border border-[#3b3c3f] bg-[#292a2d] p-4"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-white/5 p-2.5">
                          <Package className="h-5 w-5 text-gray-300" />
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-white">
                            {product.name}
                          </h3>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                            <span>Quantity: {product.quantity}</span>
                            <span>•</span>
                            <span>{product.deliveryType}</span>
                          </div>

                          {product.attributes && typeof product.attributes === "object" && Object.keys(product.attributes).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {Object.entries(product.attributes).map(([attrName, attrVal]) => (
                                <span
                                  key={attrName}
                                  className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[11px] text-gray-300"
                                >
                                  <span className="text-gray-400">{attrName}:</span> {String(attrVal)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-sm font-semibold text-white">
                          {formatPrice(product.price)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {product.quantity > 1
                            ? `${product.quantity} item${
                                product.quantity > 1 ? "s" : ""
                              }`
                            : "1 item"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Digital delivery email */}
            <SectionCard title="Send Digital Product Information" icon={Mail}>
           

              <div className="overflow-hidden rounded-lg border border-[#444444] bg-[#292a2d]">
                {/* Tiptap Toolbar */}
                <div className="flex flex-wrap items-center gap-1 border-b border-[#444444] bg-[#353638] p-2">
                  <ToolbarButton
                    editor={editor}
                    title="Bold"
                    active={editor?.isActive("bold")}
                    onClick={() =>
                      editor.chain().focus().toggleBold().run()
                    }
                  >
                    <Bold className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    editor={editor}
                    title="Italic"
                    active={editor?.isActive("italic")}
                    onClick={() =>
                      editor.chain().focus().toggleItalic().run()
                    }
                  >
                    <Italic className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    editor={editor}
                    title="Underline"
                    active={editor?.isActive("underline")}
                    onClick={() =>
                      editor.chain().focus().toggleUnderline().run()
                    }
                  >
                    <UnderlineIcon className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    editor={editor}
                    title="Strikethrough"
                    active={editor?.isActive("strike")}
                    onClick={() =>
                      editor.chain().focus().toggleStrike().run()
                    }
                  >
                    <Strikethrough className="h-4 w-4" />
                  </ToolbarButton>

                  <div className="mx-1 h-6 w-px bg-[#555555]" />

                  <ToolbarButton
                    editor={editor}
                    title="Bullet list"
                    active={editor?.isActive("bulletList")}
                    onClick={() =>
                      editor.chain().focus().toggleBulletList().run()
                    }
                  >
                    <List className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    editor={editor}
                    title="Ordered list"
                    active={editor?.isActive("orderedList")}
                    onClick={() =>
                      editor.chain().focus().toggleOrderedList().run()
                    }
                  >
                    <ListOrdered className="h-4 w-4" />
                  </ToolbarButton>

                  <div className="mx-1 h-6 w-px bg-[#555555]" />

                  <ToolbarButton
                    editor={editor}
                    title="Align left"
                    active={
                      editor?.isActive({ textAlign: "left" }) ||
                      !editor?.getAttributes("paragraph").textAlign
                    }
                    onClick={() =>
                      editor.chain().focus().setTextAlign("left").run()
                    }
                  >
                    <AlignLeft className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    editor={editor}
                    title="Align center"
                    active={editor?.isActive({ textAlign: "center" })}
                    onClick={() =>
                      editor.chain().focus().setTextAlign("center").run()
                    }
                  >
                    <AlignCenter className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    editor={editor}
                    title="Align right"
                    active={editor?.isActive({ textAlign: "right" })}
                    onClick={() =>
                      editor.chain().focus().setTextAlign("right").run()
                    }
                  >
                    <AlignRight className="h-4 w-4" />
                  </ToolbarButton>

                  <div className="mx-1 h-6 w-px bg-[#555555]" />

                  <ToolbarButton
                    editor={editor}
                    title="Link"
                    active={editor?.isActive("link")}
                    onClick={handleAddLink}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    editor={editor}
                    title="Image"
                    onClick={handleAddImage}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    editor={editor}
                    title="Quote"
                    active={editor?.isActive("blockquote")}
                    onClick={() =>
                      editor.chain().focus().toggleBlockquote().run()
                    }
                  >
                    <Quote className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    editor={editor}
                    title="Code"
                    active={editor?.isActive("codeBlock")}
                    onClick={() =>
                      editor.chain().focus().toggleCodeBlock().run()
                    }
                  >
                    <Code className="h-4 w-4" />
                  </ToolbarButton>
                </div>

                {/* Editor */}
                <EditorContent editor={editor} placeholder="Type credentials, login details, or product instructions here..." />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {inlineEmailNotice && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{inlineEmailNotice}</span>
                    </div>
                  )}
                  {inlineEmailError && (
                    <div className="flex items-center gap-1.5 text-xs text-red-400">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{inlineEmailError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className="flex items-center gap-2 w-full  justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Information
                    </>
                  )}
                </button>
              </div>
            </SectionCard>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Update Order Status */}
            <SectionCard title="Update Order Status" icon={Truck}>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Fulfillment Status
                  </label>

                  <select
                    value={selectedStatus}
                    onChange={(event) =>
                      setSelectedStatus(event.target.value)
                    }
                    className={inputClass}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={savingStatus}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingStatus ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Status
                    </>
                  )}
                </button>
              </div>
            </SectionCard>

            {/* Payment Summary */}
            <SectionCard title="Payment Summary" icon={CreditCard}>
              <div className="space-y-1">
                {/* Payment Method */}
                <InfoRow label="Payment Method">
                  <span className="rounded bg-[#353638] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white border border-[#4a4b4e]">
                    {order.paymentMethod || "bKash"}
                  </span>
                </InfoRow>

                {/* TrxID */}
                <InfoRow label="TrxID">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-amber-400">
                      {order.transactionId || "N/A"}
                    </span>
                    {order.transactionId && (
                      <button
                        type="button"
                        onClick={() => copyTrxId(order.transactionId)}
                        className="rounded p-1 text-gray-400 transition hover:bg-white/10 hover:text-white"
                        title="Copy TrxID"
                      >
                        {trxCopied ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </InfoRow>

                <InfoRow
                  label="Subtotal"
                  value={formatPrice(order.subtotal || order.total)}
                />

                {order.discount > 0 && (
                  <InfoRow
                    label="Discount"
                    value={`-${formatPrice(order.discount)}`}
                  />
                )}

                <InfoRow label="Payment Status">
                  <Badge>{order.paymentStatus}</Badge>
                </InfoRow>

                <div className="border-b border-[#3b3c3f] py-3">
                  <label className="mb-2 block text-sm text-gray-400">
                    Update Payment Status
                  </label>

                  <select
                    value={selectedPaymentStatus}
                    onChange={(event) =>
                      setSelectedPaymentStatus(event.target.value)
                    }
                    className={inputClass}
                  >
                    {paymentStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handlePaymentStatusUpdate}
                    disabled={savingPaymentStatus}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingPaymentStatus ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Payment Status
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-[#3b3c3f] pt-4">
                  <span className="text-sm font-medium text-gray-300">
                    Total
                  </span>
                  <span className="text-lg font-semibold text-white">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </SectionCard>

          </div>
        </div>
      </div>
    </div>
  );
}