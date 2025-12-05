import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { EnvInjector } from "@/components/debug";
import { cn } from "@/lib/utils";
import { getEnvironmentShort } from "@/lib/env";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "EMI Design OS: Herramientas de Sistema de Diseño con IA",
  description: "Un kit de herramientas modular para sistemas de diseño impulsado por IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Obtener el ambiente detectado desde el servidor
  const detectedEnvironment = getEnvironmentShort();

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Inyectar el ambiente detectado en el cliente */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__ENV__ = { environment: "${detectedEnvironment}" };`,
          }}
        />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased", inter.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster />
          <EnvInjector />
        </ThemeProvider>
      </body>
    </html>
  );
}
