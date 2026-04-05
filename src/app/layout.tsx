import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "L&H Consulting",
  description: "AI Consulting & Implementation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
