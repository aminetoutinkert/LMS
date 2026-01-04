import { defineRouting } from "next-intl/routing";
import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["fr", "ar", "en"],

  // Used when no locale matches
  defaultLocale: "fr",

  // Enable automatic redirection from root to default locale
  pathnames: {
    "/": "/",
    "/login": "/login",
    "/register": "/register",
    "/dashboard": "/dashboard",
    "/forgot-password": "/forgot-password",
    "/reset-password": "/reset-password",
    "/verify-email": "/verify-email",
  },
});

// Lightweight wrappers around Next.js' navigation APIs
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation(routing);
