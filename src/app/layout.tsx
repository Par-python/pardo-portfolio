import type { Metadata } from "next";
import { Pixelify_Sans, VT323 } from "next/font/google";
import { TipsShell } from "@/components/TipsShell";
import "./globals.css";

const pixelifySans = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "JJ Pardo",
  description: "A computer science student at Ateneo De Manila University",
  icons: {
    icon: "/assets/j-pard-folio-favicon.png",
    shortcut: "/assets/j-pard-folio-favicon.png",
    apple: "/assets/j-pard-folio-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pixelifySans.variable} ${vt323.variable} h-full antialiased`}>
      <body className="min-h-full font-pixelify bg-white text-black">
        {children}
        <TipsShell />
      </body>
    </html>
  );
}
