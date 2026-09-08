import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "중도금 대출 이자 계산기",
  description:
    "회차별 중도금 대출 원금과 납부일, 이자율을 입력하면 기준일까지 쌓이는 대출이자를 계산해줍니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
