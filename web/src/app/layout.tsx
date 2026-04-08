import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audience Serv Legal Hub",
  description: "Internal legal case management platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-page-bg min-h-screen">{children}</body>
    </html>
  );
}
