"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Category from "./Category";

export default function HomeCategorySections() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSections() {
      try {
        setLoading(true);
        const res = await axios.get("/api/categories?show_section=true");
        if (res.data?.success && Array.isArray(res.data.data)) {
          setSections(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load home category sections:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSections();
  }, []);

  if (loading) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between gap-4">
          <div className="h-7 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-[#171717]"
            >
              <div className="aspect-square w-full bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-lg" />
              <div className="p-2 space-y-2 mt-2">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-3/4 mx-2" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-1/2 mx-2" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-1/3 mx-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return null;
  }

  return (
    <>
      {sections.map((cat) => (
        <Category
          key={cat._id}
          title={cat.name}
          categoryName={cat.name}
          limit={4}
        />
      ))}
    </>
  );
}
