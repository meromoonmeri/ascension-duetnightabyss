import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: "ASCENSION — Wiki Officiel",
  description: "Encyclopédie complète de l'univers Ascension. Arts, races, cosmologie, créatures et bien plus.",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "ASCENSION — Wiki Officiel",
    description: "Encyclopédie complète de l'univers Ascension",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800;900&family=Noto+Sans+JP:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: 'WorldText';
                src: url('/rubrique-assets/WorldText.otf') format('opentype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
              }
              @font-face {
                font-family: 'Gloock';
                src: url('/rubrique-assets/Gloock-Regular.ttf') format('truetype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
              }
            `,
          }}
        />
        <link rel="preload" as="image" href="/logo.png" />
        <link rel="preload" as="video" href="/hero-bg.mp4" type="video/mp4" />
      </head>
      <body className="wiki-body ba-theme antialiased min-h-screen flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}