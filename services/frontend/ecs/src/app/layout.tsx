import type { Metadata } from "next";
import { Outfit, Rubik } from "next/font/google";

import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Earist | Extension Community Service",
  description: "Earist Extension Community Service",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <body className={`${rubik.variable} ${outfit.variable} font-sans antialiased`}>
          {children}
        </body>
      </html>
  );
}
