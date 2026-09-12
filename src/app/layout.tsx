import type { Metadata } from "next";
import "./globals.css";

export const SITE_URL = "https://www.parquetly.com";

const DESCRIPTION =
  "Free online Parquet file viewer that runs entirely in your browser. Inspect schemas, browse rows, read row group statistics, and run SQL with DuckDB. Your file is never uploaded.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Free Online Parquet Viewer - No Upload, Runs in Your Browser",
    template: "%s | Parquetly",
  },
  description: DESCRIPTION,
  applicationName: "Parquetly",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Parquetly",
    title: "Free Online Parquet Viewer - No Upload, Runs in Your Browser",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Parquet Viewer - No Upload, Runs in Your Browser",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
