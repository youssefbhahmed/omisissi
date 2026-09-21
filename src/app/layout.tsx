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

// Light is the brand's primary mode: dark only applies when the visitor
// explicitly picked it with the toggle — the OS preference is ignored.
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&display=swap"
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
