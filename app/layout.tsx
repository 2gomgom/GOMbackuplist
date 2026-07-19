import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '곰곰 아카이브',
  description: '페르소나 백업 사이트',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-bg text-text min-h-screen">{children}</body>
    </html>
  );
}
