import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "个人博客", template: "%s · 个人博客" },
  description: "一个记录想法、经验和生活片段的个人博客。",
  openGraph: { title: "个人博客", description: "记录想法，分享经验。", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
