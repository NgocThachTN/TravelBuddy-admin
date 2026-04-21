"use client";

import { useEffect, useState } from "react";
import { API_ROUTES } from "@/lib/constants";
import type { MemberLevelCatalogData } from "@/types";

export function useMemberLevelCatalog() {
  const [catalog, setCatalog] = useState<MemberLevelCatalogData | null>(null);

  useEffect(() => {
    let isDisposed = false;

    async function loadCatalog() {
      try {
        const response = await fetch(API_ROUTES.SYSTEM_RULES_MEMBER_LEVELS, {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          success?: boolean;
          data?: MemberLevelCatalogData;
        };

        if (!isDisposed && payload?.data) {
          setCatalog(payload.data);
        }
      } catch {
        // Preserve static fallback labels when catalog cannot be loaded.
      }
    }

    void loadCatalog();

    return () => {
      isDisposed = true;
    };
  }, []);

  return catalog;
}
