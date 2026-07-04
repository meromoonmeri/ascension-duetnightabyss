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
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: 'WorldText';
                src: url('/font/WorldText.otf') format('opentype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
              }
              @font-face {
                font-family: 'Gloock';
                src: url('/font/Gloock-Regular.ttf') format('truetype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
              }
            `,
          }}
        />
        <link rel="preload" as="image" href="/logo.png" />
      </head>
      <body className="antialiased" style={{ margin: 0, padding: 0, background: '#000', overflowX: 'hidden' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}