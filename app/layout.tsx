import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Navbar from "./components/Navbar";
import { CookiesProvider } from "next-client-cookies/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "myChatApp",
  description: "myChatApp is myChatApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className + ' flex flex-col h-dvh overflow-hidden '}>
        <CookiesProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <div className="flex-grow overflow-y-scroll dark:bg-slate-950 bg-slate-200">
              {children}
            </div>
          </ThemeProvider>
        </CookiesProvider>
      </body>
    </html>
  );
}
