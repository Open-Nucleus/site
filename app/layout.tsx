import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open Nucleus",
  description:
    "An open-source ecosystem of tools for healthcare in zero-connectivity environments.",
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
