"use client";

export type DashboardFlash = {
  type: "success" | "info" | "error";
  title: string;
  message?: string;
};

const DASHBOARD_FLASH_KEY = "shoeclean-dashboard-flash";

export function setDashboardFlash(flash: DashboardFlash) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(DASHBOARD_FLASH_KEY, JSON.stringify(flash));
}

export function takeDashboardFlash(): DashboardFlash | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(DASHBOARD_FLASH_KEY);

  if (!raw) {
    return null;
  }

  window.sessionStorage.removeItem(DASHBOARD_FLASH_KEY);

  try {
    return JSON.parse(raw) as DashboardFlash;
  } catch {
    return null;
  }
}
