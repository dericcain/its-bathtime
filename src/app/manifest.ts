import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "It's Bathtime!",
    short_name: "Bathtime",
    description: "Comic book style PWA for tracking kids' bath order.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2e32e",
    theme_color: "#2a62a6",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable" // added explicitly, though default is generic
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}
