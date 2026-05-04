import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import TranslateBootstrap from "@/components/TranslateBootstrap";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Parent's Guide | Pehchaan Careers",
  description:
    "Honest FAQ for parents on careers, government jobs, streams, and modern work — in English or Hinglish.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className={`relative z-[1] min-h-full ${poppins.className}`}>
        <TranslateBootstrap />
        {children}
      </body>
    </html>
  );
}
