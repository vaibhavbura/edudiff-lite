import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { AuthSync } from "@/components/auth/AuthSync";
import { PageTransition } from "@/components/ui/PageTransition";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduDiff Lite",
  description: "AI-Powered Question-to-Video Learning Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${outfit.className} antialiased overflow-x-hidden`}>
          <AuthSync />
          <PageTransition>
            {children}
          </PageTransition>
        </body>
      </html>
    </ClerkProvider>
  );
}
