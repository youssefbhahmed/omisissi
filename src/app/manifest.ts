import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Ommi Sissi — Plats faits maison",
        short_name: "Ommi Sissi",
        description:
            "Trouvez des cuisiniers à domicile talentueux près de chez vous. Des plats frais faits maison, préparés par de vraies personnes.",
        start_url: "/dashboard",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#F6EFE2",
        theme_color: "#F6EFE2",
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
