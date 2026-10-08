"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function WhatsAppChat() {
  const [whatsappData, setWhatsappData] = useState({
    enabled: true,
    url: "",
    loaded: false,
  });

  useEffect(() => {
    let ignore = false;
    async function fetchSettings() {
      try {
        const res = await axios.get("/api/settings");
        if (!ignore && res.data?.success && res.data?.data?.whatsapp) {
          const w = res.data.data.whatsapp;
          const isEnabled = w.enabled !== false;
          const rawNum = w.number || w.phoneNumber || "8801711426565";
          const cleanNum = String(rawNum).replace(/[^0-9]/g, "");
          const msg =
            typeof w.message === "string" && w.message.trim()
              ? w.message.trim()
              : "";

          const link = cleanNum
            ? `https://wa.me/${cleanNum}${
                msg ? `?text=${encodeURIComponent(msg)}` : ""
              }`
            : "";

          setWhatsappData({
            enabled: isEnabled,
            url: link,
            loaded: true,
          });
        }
      } catch {
        if (!ignore) {
          setWhatsappData({
            enabled: true,
            url: "https://wa.me/8801711426565",
            loaded: true,
          });
        }
      }
    }

    fetchSettings();
    return () => {
      ignore = true;
    };
  }, []);

  // Do not render if settings haven't loaded, or WhatsApp is disabled in settings, or no link exists
  if (!whatsappData.loaded || !whatsappData.enabled || !whatsappData.url) {
    return null;
  }

  return (
    <a
      href={whatsappData.url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-10 right-4 z-50 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-all duration-300 hover:scale-110 hover:bg-[#20ba5a] hover:shadow-2xl active:scale-95 lg:bottom-6 lg:right-6 group"
      aria-label="Chat on WhatsApp"
    >
      <span className="sr-only">Chat on WhatsApp</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-7 w-7 sm:h-8 sm:w-8 transition-transform group-hover:rotate-6"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.67-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M20.52 3.449A11.816 11.816 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.875 11.875 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.89a11.821 11.821 0 0 0-3.422-8.455zm-8.47 19.349h-.004a9.886 9.886 0 0 1-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374a9.884 9.884 0 0 1-1.511-5.275c.002-5.46 4.449-9.9 9.91-9.9a9.84 9.84 0 0 1 7.008 2.904 9.86 9.86 0 0 1 2.898 7.01c-.003 5.46-4.45 9.894-9.912 9.894z" />
      </svg>
    </a>
  );
}