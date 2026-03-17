import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cloudsting",
    short_name: "Cloudsting",
    description: "Minecraft server hosting with instant setup, NVMe storage, and DDoS protection.",
    start_url: "/",
    display: "standalone",
    background_color: "#07110a",
    theme_color: "#1AD76F",
    categories: ["games", "business", "utilities"],
    icons: [
      {
        src: "/kx-minecraft-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}