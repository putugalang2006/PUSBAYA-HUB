import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/Toaster";

export const metadata: Metadata = {
  title: "PUSBAYA HUB — Sistem Pendataan Organisasi ST PUSBAYA",
  description:
    "Dashboard manajemen organisasi Sekaa Teruna Putra Settu Bhakti Jaya, Banjar Campuan, Desa Adat Kerobokan.",
  applicationName: "PUSBAYA HUB",
  authors: [{ name: "ST PUSBAYA" }],
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#07080b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
