import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "Ommi Sissi — Des plats faits maison, préparés avec amour",
  description:
    "Trouvez des cuisiniers à domicile talentueux près de chez vous. Des plats frais faits maison, préparés par de vraies personnes — directement dans votre cuisine ou livrés chez vous.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ommi Sissi",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "Ommi Sissi — Des plats faits maison, préparés avec amour",
    description: "Trouvez des cuisiniers à domicile talentueux près de chez vous.",
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6EFE2" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const themeScript = `
  (function() {
    try {
      var localTheme = localStorage.getItem('theme');
      var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      var theme = localTheme || systemTheme;
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
