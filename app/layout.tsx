import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "../components/layout/AppLayout";
import { AuthProvider } from "../components/auth/AuthProvider";
import { ThemeProvider, ThemeScript } from "../components/ui/ThemeProvider";

export const metadata: Metadata = {
  title: "Kiya Law - Command Center",
  description: "Legal Billing and Dashboard Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body className="text-on-background font-body-md h-screen overflow-hidden">
        <ThemeProvider>
          <AuthProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}