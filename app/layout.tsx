import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open Nucleus",
  description:
    "An offline-first electronic health record for places where connectivity is zero.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
