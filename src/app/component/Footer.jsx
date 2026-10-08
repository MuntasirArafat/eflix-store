"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

function Footer() {
  const { lang, t } = useLanguage();

  const links = [
    { label: lang === "bn" ? "আমাদের সম্পর্কে" : "About Us", href: "#" },
    { label: lang === "bn" ? "ব্যবহারের শর্তাবলী" : "Terms of Service", href: "#" },
    { label: lang === "bn" ? "গোপনীয়তা নীতি" : "Privacy Policy", href: "#" },
    { label: lang === "bn" ? "রিফান্ড নীতিমালা" : "Refund Policy", href: "#" },
  ];

  const socials = [
    {
      label: "Discord",
      href: "#",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.54 4.94A16.7 16.7 0 0 0 15.4 3.66l-.5 1.02a15.5 15.5 0 0 0-5.8 0l-.5-1.02a16.8 16.8 0 0 0-4.15 1.28C1.82 8.9 1.1 12.75 1.45 16.54a16.8 16.8 0 0 0 5.1 2.58l1.24-1.68a10.5 10.5 0 0 1-1.95-.94l.48-.37c3.76 1.74 7.83 1.74 11.54 0l.48.37c-.63.38-1.28.69-1.95.94l1.24 1.68a16.8 16.8 0 0 0 5.1-2.58c.4-4.39-.68-8.2-4.19-11.6ZM8.85 14.82c-1.1 0-2-.98-2-2.18s.88-2.18 2-2.18 2 .98 2 2.18-.9 2.18-2 2.18Zm6.3 0c-1.1 0-2-.98-2-2.18s.88-2.18 2-2.18 2 .98 2 2.18-.9 2.18-2 2.18Z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: "#",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle
            cx="17.5"
            cy="6.5"
            r="1"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: "#",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5 21v-8h3l.5-4h-3.5V6.5c0-1.16.38-1.95 2-1.95H17V1.1C16.3 1.03 15.5 1 14.5 1 11.5 1 9.5 2.83 9.5 6.2V9H6v4h3.5v8h4Z" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: "#",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.2 3a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM3.3 9h3.8v12H3.3V9Zm6.1 0H13v1.64h.05c.5-.95 1.73-1.94 3.56-1.94 3.8 0 4.5 2.5 4.5 5.75V21h-3.8v-5.8c0-1.38-.03-3.16-1.93-3.16-1.93 0-2.22 1.5-2.22 3.06V21H9.4V9Z" />
        </svg>
      ),
    },
    {
      label: "X",
      href: "#",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.4L6.48 22H3.37l7.24-8.28L2.8 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.8h1.73L8.27 4.1H6.42L17.8 19.8Z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="w-full bg-[#171717] text-white">
      <div
        className="
          mx-auto
          flex
          min-h-[145px]
          w-full
          max-w-[2200px]
          flex-col
          items-center
          justify-center
          gap-6
          px-5
          py-8
          text-center

          sm:px-8

          lg:flex-row
          lg:items-center
          lg:justify-between
          lg:gap-10
          lg:px-10
          lg:py-10
          lg:text-left
        "
      >
        {/* Left content */}
        <div className="min-w-0 flex-1">
          <p
            className="
              text-xs
              leading-6
              text-[#eeeeee]
              sm:text-sm
              lg:text-sm
            "
          >
            {t("about_desc")}
          </p>

          {/* Footer navigation */}
          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-y-2
              text-xs
              text-[#eeeeee]

              sm:text-sm

              lg:justify-start
              lg:text-sm
            "
          >
            <span className="whitespace-nowrap">
              © 2026 eflix.store - {t("all_rights_reserved")}
            </span>

            {links.map((link) => (
              <React.Fragment key={link.label}>
                <span
                  aria-hidden="true"
                  className="mx-2 text-gray-500 sm:mx-3"
                >
                  |
                </span>

                <a
                  href={link.href}
                  className="
                    whitespace-nowrap
                    transition-colors
                    duration-200
                    hover:text-white
                    hover:underline
                  "
                >
                  {link.label}
                </a>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Social media icons */}
        <div
          className="
            flex
            shrink-0
            items-center
            justify-center
            gap-2.5
            sm:gap-3
          "
        >
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              title={social.label}
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-white
                transition-all
                duration-200
                hover:bg-white
                hover:text-[#303030]

                sm:h-[40px]
                sm:w-[40px]
              "
            >
              <span className="h-5 w-5 sm:h-[23px] sm:w-[23px]">
                {social.icon}
              </span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;