import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TrafficTracker from "@/components/TrafficTracker";
import { LanguageProvider } from "@/context/LanguageContext";
import NextTopLoader from 'nextjs-toploader';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Eflix.store | #1 Digital Account Seller in Bangladesh",

  description:
    "Eflix.store is a leading digital account store in Bangladesh. Get affordable Netflix, ChatGPT, Gemini, Spotify, Canva, YouTube Premium and other popular digital subscriptions with fast delivery and reliable support.",

  keywords: [
    "Eflix.store",
    "digital accounts Bangladesh",
    "digital account seller Bangladesh",
    "premium accounts Bangladesh",
    "shared accounts Bangladesh",
    "Netflix account Bangladesh",
    "Netflix shared account",
    "ChatGPT account Bangladesh",
    "ChatGPT Plus Bangladesh",
    "Gemini account Bangladesh",
    "Google Gemini Bangladesh",
    "Spotify Premium Bangladesh",
    "Canva Pro Bangladesh",
    "YouTube Premium Bangladesh",
    "premium subscription Bangladesh",
    "streaming accounts Bangladesh",
    "AI tools Bangladesh",
    "AI subscription Bangladesh",
    "cheap premium accounts Bangladesh",
    "online digital store Bangladesh",
    "digital products Bangladesh",
    "subscription store Bangladesh",
    "premium services Bangladesh",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-[#0A0A0A] text-white">
        <NextTopLoader />
        <LanguageProvider>
          <TrafficTracker />
          <main className="flex-1">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}

