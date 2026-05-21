import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Titan AI Audit | Premium Local Business AI Audits",
  description:
    "A bold SaaS landing page for Titan AI Audit, built for local businesses that want a sharper AI growth edge."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
