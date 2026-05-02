"use client";

import { useEffect, useState } from "react";

export function useResponsiveLimit(
  mobileCount: number,
  desktopCount: number,
) {
  const [limit, setLimit] = useState(mobileCount);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setLimit(mql.matches ? desktopCount : mobileCount);
    const handler = (e: MediaQueryListEvent) =>
      setLimit(e.matches ? desktopCount : mobileCount);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [mobileCount, desktopCount]);

  return limit;
}
