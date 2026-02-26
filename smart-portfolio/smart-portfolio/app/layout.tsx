
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Portfolio',
  description: '매도/물타기/매수 추천 포트폴리오 관리',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
