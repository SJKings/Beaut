import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["500", "600"] });

export const metadata: Metadata = {
  title: { default: "Beaut · Beauty care, booked in a minute", template: "%s · Beaut" },
  description: "Book hair, nails, makeup and facials without signing up. Every booking gets a code you use to find, change or cancel it.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
