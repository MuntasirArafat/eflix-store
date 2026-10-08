"use client";

import React, { useState } from "react";
import { LoaderCircle } from "lucide-react";

function Button({ children, action, ...props }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    if (loading) return;

    setLoading(true);

    // Show loader for 2 seconds
    await new Promise((resolve) => setTimeout(resolve,500));

    try {
      if (action) {
        await action(e);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      {...props}
      className={`bg-white text-black text-sm font-medium cursor-pointer rounded-full p-3 px-4 w-full mb-4 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 ${
        loading ? "opacity-70 cursor-not-allowed" : ""
      }`}
    >
      {loading ? (
        <>
          <LoaderCircle size={18} className="animate-spin" />
          Please wait...
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;

