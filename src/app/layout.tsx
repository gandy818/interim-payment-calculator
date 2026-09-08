import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "중도금 대출 이자 계산기",
  description:
    "회차별 중도금 대출 원금과 납부일, 이자율을 입력하면 기준일까지 쌓이는 대출이자를 계산해줍니다.",
  other: {
    "google-adsense-account": "ca-pub-2998824044846392",
  },
};

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <div className="text-center py-5 text-[12px] text-ink-soft">
          <Link href="/privacy" className="underline hover:text-ink">
            개인정보처리방침
          </Link>
        </div>
      </body>
    </html>
  );
}
