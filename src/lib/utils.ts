import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const BASE_URL: string = "https://api.expres-pro.com/api/v1";
export const PROFILE_BASE_URL: string = "https://api.expres-pro.com";
export const safeStorage = {
  getItem(key: string) {
    if (typeof window === "undefined") return null;

    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  },

  setItem(key: string, value: string, persistent = false) {
    if (typeof window === "undefined") return;

    if (persistent) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  },

  removeItem(key: string) {
    if (typeof window === "undefined") return;

    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};
