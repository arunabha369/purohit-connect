import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PurohitConnect",
    short_name: "PurohitConnect",
    description: "Book verified purohits for every Vedic ceremony.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090d",
    theme_color: "#09090d",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
