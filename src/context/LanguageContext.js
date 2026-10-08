"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const translations = {
  en: {
    // Navigation
    home: "Home",
    categories: "Categories",
    all_categories: "All Categories",
    support: "Support",
    track_order: "Track Order",
    login: "Login",
    dashboard: "Dashboard",
    search_placeholder: "Search for streaming, software, accounts...",
    search: "Search",
    cart: "Cart",
    select_language: "Select Language",
    bangla: "বাংলা",
    english: "English",
    language: "Language",

    // Home / Hero
    hero_badge: "#1 Digital Store in Bangladesh",
    hero_title: "Premium Digital Subscriptions",
    hero_subtitle: "Affordable Netflix, ChatGPT, Spotify, Canva Pro & more with instant delivery and 24/7 dedicated support.",
    browse_store: "Browse Store",
    instant_delivery: "Instant Delivery",
    support_24_7: "24/7 Dedicated Support",
    genuine_accounts: "100% Genuine Accounts",
    verified_seller: "Verified Seller",
    trending_accounts: "Trending Accounts",
    view_all: "View All",
    browse_by_category: "Browse by Category",
    featured_products: "Featured Products",
    starting_from: "Starting from",
    buy_now: "Buy Now",
    in_stock: "In Stock",
    out_of_stock: "Out of Stock",
    no_products: "No products available at the moment.",

    // Product Details
    special_offer: "Special Offer: Instant Fulfillment",
    available: "Available",
    limited_stock: "Limited stock",
    quantity: "Quantity",
    total: "Total",
    proceed_checkout: "Proceed to Checkout",
    description: "Description",
    features: "Features & Perks",
    share: "Share",
    view_more: "View more",
    view_less: "View less",
    copied: "Copied to clipboard!",
    purchase_options: "Purchase Options",
    select_package: "Select your package",

    // Checkout
    secure_checkout: "Secure Checkout",
    checkout_subtitle: "Complete your information and confirm your payment.",
    customer_info_subtitle: "Enter your contact details",
    email_delivery: "Email Address (for order delivery) *",
    phone_label: "Mobile Number *",
    enter_name: "Enter your full name",
    trxid_label: "Transaction ID (TrxID) *",
    trxid_helper: "Please send payment of ৳{total} BDT to the number above, then enter the TrxID.",
    product_price: "Product Price",
    coupon_code: "Coupon Code",
    including_fees: "Including all applicable fees",
    agree_terms_checkout: "By confirming this order, you agree that the payment information and Transaction ID you provide are correct.",
    processing_order: "Processing Order...",
    checkout_title: "Checkout",
    customer_info: "Customer Information",
    name: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    payment_method: "Payment Method",
    payment_channel_subtitle: "Select your preferred payment channel",
    transaction_id: "Transaction ID (TrxID)",
    delivery_notes: "Delivery Notes / TrxID details",
    have_coupon: "Have a coupon code?",
    enter_coupon: "Enter coupon code",
    apply_coupon: "Apply",
    coupon_applied: "Coupon Applied",
    remove: "Remove",
    order_summary: "Order Summary",
    subtotal: "Subtotal",
    discount: "Discount",
    total_amount: "Total Amount",
    place_order: "Confirm & Place Order",
    placing_order: "Placing Order...",

    // Confirmation
    thank_you_title: "Thank you for your order!",
    order_placed_desc: "Your order has been successfully placed. We've received your payment information and will process your order shortly.",
    order_id_label: "Order ID",
    confirmation_email_title: "Confirmation email",
    confirmation_email_desc: "We'll send your digital product details to",
    order_reviewing_title: "Order is being reviewed",
    order_reviewing_desc: "Your payment and transaction details are being checked. Once confirmed, your digital product credentials will be dispatched.",
    continue_shopping: "Continue Shopping",
    browse_more_products: "Browse More Products",
    order_support_note: "Thank you for choosing Eflix. If you have any questions about your order, please contact our support team.",

    // Filter & Shop
    all_products: "All Products",
    filter_by_category: "Categories",
    sort_by: "Sort by",
    price_low_high: "Price: Low to High",
    price_high_low: "Price: High to Low",
    price_range: "Price Range",
    reset_filter: "Reset Filters",
    showing_results: "Showing results",
    updating_products: "Updating products...",
    searching: "Searching...",

    // Footer
    about_eflix: "About Eflix",
    about_desc: "Eflix.store is a leading digital subscription platform in Bangladesh. Get affordable premium accounts with high reliability.",
    quick_links: "Quick Links",
    customer_support: "Customer Support",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    refund: "Refund Policy",
    all_rights_reserved: "All rights reserved.",
    whatsapp_chat: "Chat with us on WhatsApp",
  },
  bn: {
    // Navigation
    home: "হোম",
    categories: "ক্যাটাগরি",
    all_categories: "সকল ক্যাটাগরি",
    support: "সহায়তা",
    track_order: "অর্ডার ট্র্যাক",
    login: "লগইন",
    dashboard: "ড্যাশবোর্ড",
    search_placeholder: "স্ট্রিমিং, সফটওয়্যার বা অ্যাকাউন্ট খুঁজুন...",
    search: "অনুসন্ধান",
    cart: "কার্ট",
    select_language: "ভাষা নির্বাচন করুন",
    bangla: "বাংলা",
    english: "English",
    language: "ভাষা",

    // Home / Hero
    hero_badge: "বাংলাদেশের ১ নম্বর ডিজিটাল স্টোর",
    hero_title: "প্রিমিয়াম ডিজিটাল সাবস্ক্রিপশন",
    hero_subtitle: "সুলভ মূল্যে নেটফ্লিক্স, চ্যাটজিপিটি, স্পটিফাই, ক্যানভা প্রো সহ জনপ্রিয় সকল অ্যাকাউন্ট কিনুন তাৎক্ষণিক ডেলিভারি ও ২৪/৭ সাপোর্টে।",
    browse_store: "স্টোর ব্রাউজ করুন",
    instant_delivery: "তাৎক্ষণিক ডেলিভারি",
    support_24_7: "২৪/৭ কাস্টমার সাপোর্ট",
    genuine_accounts: "১০০% জেনুইন অ্যাকাউন্ট",
    verified_seller: "ভেরিফাইড প্ল্যাটফর্ম",
    trending_accounts: "জনপ্রিয় অ্যাকাউন্টসমূহ",
    view_all: "আরও",
    browse_by_category: "ক্যাটাগরি অনুযায়ী দেখুন",
    featured_products: "বিশেষ পণ্যসমূহ",
    starting_from: "শুরু মাত্র",
    buy_now: "এখনই কিনুন",
    in_stock: "স্টকে আছে",
    out_of_stock: "স্টক শেষ",
    no_products: "বর্তমানে কোনো পণ্য পাওয়া যায়নি।",

    // Product Details
    special_offer: "বিশেষ অফার: ইনস্ট্যান্ট ডেলিভারি",
    available: "উপলব্ধ",
    limited_stock: "সীমিত স্টক",
    quantity: "পরিমাণ",
    total: "সর্বমোট",
    proceed_checkout: "অর্ডারে এগিয়ে যান",
    description: "পণ্যের বিবরণ",
    features: "সুবিধাসমূহ",
    share: "শেয়ার করুন",
    view_more: "আরও দেখুন",
    view_less: "কম দেখুন",
    copied: "ক্লিপবোর্ডে কপি হয়েছে!",
    purchase_options: "প্যাকেজ অপশন",
    select_package: "আপনার প্যাকেজ নির্বাচন করুন",

    // Checkout
    secure_checkout: "নিরাপদ চেকআউট",
    checkout_subtitle: "আপনার তথ্য প্রদান করুন এবং পেমেন্ট সম্পন্ন করুন।",
    customer_info_subtitle: "আপনার যোগাযোগের তথ্য প্রদান করুন",
    email_delivery: "ইমেইল ঠিকানা (অর্ডার ডেলিভারির জন্য) *",
    phone_label: "মোবাইল নম্বর *",
    enter_name: "আপনার পুরো নাম লিখুন",
    trxid_label: "ট্রানজেকশন আইডি (TrxID) *",
    trxid_helper: "অনুগ্রহ করে উপরের নম্বরে ৳{total} টাকা পাঠিয়ে TrxID লিখুন।",
    product_price: "পণ্যের মূল্য",
    coupon_code: "কুপন কোড",
    including_fees: "সকল চার্জ অন্তর্ভুক্ত",
    agree_terms_checkout: "অর্ডার নিশ্চিত করার মাধ্যমে আপনি সম্মত হচ্ছেন যে প্রদত্ত পেমেন্ট তথ্য ও TrxID সঠিক।",
    processing_order: "অর্ডার সম্পন্ন হচ্ছে...",
    checkout_title: "চেকআউট",
    customer_info: "গ্রাহকের তথ্য",
    name: "আপনার পুরো নাম",
    email: "ইমেইল ঠিকানা",
    phone: "মোবাইল নম্বর",
    payment_method: "পেমেন্ট মাধ্যম",
    payment_channel_subtitle: "আপনার পছন্দের পেমেন্ট মাধ্যম নির্বাচন করুন",
    transaction_id: "ট্রানজেকশন আইডি (TrxID)",
    delivery_notes: "পেমেন্ট বিবরণ বা TrxID নোট",
    have_coupon: "কুপন কোড আছে?",
    enter_coupon: "কুপন কোড লিখুন",
    apply_coupon: "প্রয়োগ করুন",
    coupon_applied: "কুপন সফলভাবে যুক্ত হয়েছে",
    remove: "মুছুন",
    order_summary: "অর্ডার সারাংশ",
    subtotal: "সাবটোটাল",
    discount: "ছাড়",
    total_amount: "সর্বমোট প্রদেয়",
    place_order: "অর্ডার নিশ্চিত করুন",
    placing_order: "অর্ডার প্রসেস হচ্ছে...",

    // Confirmation
    thank_you_title: "আপনার অর্ডারের জন্য ধন্যবাদ!",
    order_placed_desc: "আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে। পেমেন্ট তথ্য যাচাই করে শীঘ্রই আপনার ডিজিটাল প্রোডাক্ট পাঠানো হবে।",
    order_id_label: "অর্ডার আইডি",
    confirmation_email_title: "নিশ্চিতকরণ ইমেইল",
    confirmation_email_desc: "আমরা আপনার ডিজিটাল পণ্যের বিবরণ পাঠাব এই ঠিকানায়:",
    order_reviewing_title: "অর্ডার যাচাই করা হচ্ছে",
    order_reviewing_desc: "আপনার পেমেন্ট ও ট্রানজেকশন তথ্য যাচাই করা হচ্ছে। নিশ্চিত হওয়ার সাথে সাথেই ডিজিটাল ডেলিভারি দেওয়া হবে।",
    continue_shopping: "আরও কেনাকাটা করুন",
    browse_more_products: "আরও প্রোডাক্ট দেখুন",
    order_support_note: "Eflix বেছে নেওয়ার জন্য ধন্যবাদ। অর্ডার সম্পর্কিত যেকোনো সহায়তার জন্য আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।",

    // Filter & Shop
    all_products: "সকল পণ্য",
    filter_by_category: "ক্যাটাগরি",
    sort_by: "সাজান",
    price_low_high: "মূল্য: কম থেকে বেশি",
    price_high_low: "মূল্য: বেশি থেকে কম",
    price_range: "মূল্যের সীমা",
    reset_filter: "রিসেট ফিল্টার",
    showing_results: "ফলাফল প্রদর্শন",
    updating_products: "পণ্য ফিল্টার হচ্ছে...",
    searching: "অনুসন্ধান করা হচ্ছে...",

    // Footer
    about_eflix: "Eflix সম্পর্কে",
    about_desc: "Eflix.store বাংলাদেশের বিশ্বস্ত ডিজিটাল অ্যাকাউন্ট ও সাবস্ক্রিপশন প্ল্যাটফর্ম। প্রিমিয়াম সাবস্ক্রিপশন কিনুন সুলভ মূল্যে ও নির্ভরযোগ্য সাপোর্টে।",
    quick_links: "প্রয়োজনীয় লিংক",
    customer_support: "কাস্টমার সাপোর্ট",
    terms: "শর্তাবলী",
    privacy: "গোপনীয়তা নীতি",
    refund: "রিফান্ড নীতিমালা",
    all_rights_reserved: "সর্বস্বত্ব সংরক্ষিত।",
    whatsapp_chat: "হোয়াটসঅ্যাপে চ্যাট করুন",
  },
};

const LanguageContext = createContext({
  lang: "en",
  setLang: () => { },
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("eflix_lang");
      if (saved === "bn" || saved === "en") {
        queueMicrotask(() => {
          setLangState(saved);
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const setLang = (newLang) => {
    if (newLang === "bn" || newLang === "en") {
      setLangState(newLang);
      try {
        localStorage.setItem("eflix_lang", newLang);
      } catch {
        // ignore
      }
    }
  };

  const t = (key) => {
    if (!translations[lang]) return key;
    return translations[lang][key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
