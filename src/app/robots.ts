import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private, per-user pages have no value in search results.
      disallow: ["/admin", "/purohit-dashboard", "/bookings", "/profile", "/book/", "/login"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
