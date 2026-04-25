import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FoMO 错失恐惧量表",
  description: "面向中国大学生的 FoMO 错失恐惧心理测量问卷"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
