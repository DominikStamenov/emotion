import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#08080a",
    description:
      "eMotion digital agency — strategy, design, technology, motion and AI.",
    display: "standalone",
    icons: [
      {
        sizes: "192x192",
        src: "/brand/favicon-192x192.png",
        type: "image/png",
      },
      {
        sizes: "180x180",
        src: "/brand/apple-touch-icon.png",
        type: "image/png",
      },
    ],
    name: "eMotion",
    short_name: "eMotion",
    start_url: "/",
    theme_color: "#08080a",
  };
}
