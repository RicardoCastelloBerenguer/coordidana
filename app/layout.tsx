import type { Metadata } from "next";
import localFont from "next/font/local";
import { Recursive } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "./contexts/UserContext";

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
  title: "Coordidana - Ayuda a las Víctimas de la DANA en Valencia",
  description:
    "Coordidana es una plataforma creada para ofrecer ayuda y apoyo a las víctimas del desastre natural DANA en Valencia. Si necesitas asistencia, regístrate y recibe apoyo inmediato.",
  keywords:
    "DANA, Valencia, ayuda a las víctimas, desastre natural, emergencia, asistencia humanitaria, víctimas DANA Valencia",
  authors: [{ name: "Coordidana", url: "https://www.coordidana.org" }],
  openGraph: {
    type: "website",
    url: "https://www.coordidana.org",
    title: "Coordidana - Ayuda a las Víctimas de la DANA en Valencia",
    description:
      "Coordidana es una plataforma creada para ofrecer ayuda y apoyo a las víctimas del desastre natural DANA en Valencia. Si necesitas asistencia, regístrate y recibe apoyo inmediato.",
    images: [
      {
        url: "https://www.coordidana.org/images/dana-help-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Ayuda a las víctimas de la DANA en Valencia",
      },
    ],
  },
};

const recursive = Recursive({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <meta name="robots" content="index, follow" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${recursive.className}`}
      >
        <div className="min-h-screen flex flex-col">
          <UserProvider>
            <Header />
            <main className="flex-grow">{children}</main>

            <Footer />
          </UserProvider>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
