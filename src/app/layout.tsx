import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link"
import {
  Wrench,
} from "lucide-react"
import React from "react";
import SideNav from "@/components/commons/SideNav";
import HeaderTitle from "@/components/commons/HeaderTitle";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Wrench className="h-6 w-6" />
                <span className="">Dev Utils</span>
              </Link>
            </div>
            <div className="flex-1">
              <SideNav />
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <div className="w-full flex-1">
              <HeaderTitle />
            </div>
          </header>
          {children}
        </div>
      </div>
      </body>
    </html>
  );
}
