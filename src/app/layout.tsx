import type { Metadata } from "next";
import { Pixelify_Sans, VT323 } from "next/font/google";
import { TipsShell } from "@/components/TipsShell";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
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
    <html
      lang="en"
      data-theme="win95"
      className={`${pixelifySans.variable} ${vt323.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='dark'?'dark':'win95';}catch(e){}})();",
          }}
        />
      </head>
      <body className="min-h-full">
        <ThemeProvider>
          {children}
          <TipsShell />
        </ThemeProvider>
      </body>
    </html>
  );
}
