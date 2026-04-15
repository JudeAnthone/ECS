import type { Metadata } from "next";
import Script from "next/script";
import { Outfit, Rubik } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/shared/components/providers/theme-provider";
import { getThemeBootstrapScript } from "@/shared/lib/theme";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${rubik.variable} ${outfit.variable} font-sans antialiased`}>
        <Script id="theme-bootstrap" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: getThemeBootstrapScript() }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
