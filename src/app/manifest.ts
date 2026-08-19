import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Foodie — Home-Cooked Meals",
        short_name: "Foodie",
        description:
            "Connect with talented home cooks in your area. Fresh, home-cooked meals prepared by real people.",
        start_url: "/dashboard",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#f4efe6",
        theme_color: "#f4efe6",
        categories: ["food", "lifestyle"],
        icons: [
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: "/icons/icon-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
