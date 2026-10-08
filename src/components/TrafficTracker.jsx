"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const VISITOR_KEY = "eflix_vid";

// Persistent anonymous per-browser ID, so unique visitors are not
// collapsed together when they share an IP (localhost, NAT, proxies).
function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch (e) {
    return null;
  }
}

export default function TrafficTracker() {
  const pathname = usePathname();
  const lastPath = useRef("");

  useEffect(() => {
    // Avoid tracking admin pages
    if (pathname && pathname.startsWith("/admin")) {
      return;
    }

    if (lastPath.current === pathname) {
      return;
    }
    lastPath.current = pathname;

    const payload = JSON.stringify({ visitorId: getVisitorId(), path: pathname });

    // Send tracking ping via fetch or beacon
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/track",
          new Blob([payload], { type: "application/json" })
        );
      } else {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch (e) {
      // Non-blocking
    }
  }, [pathname]);

  return null;
}
