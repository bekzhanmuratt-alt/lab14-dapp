import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab 14 Ballot dApp",
  description: "Student laboratory work №14 - decentralized voting dApp",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
