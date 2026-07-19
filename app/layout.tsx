import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '이미지 아카이브',
  description: '지인들과 함께 쓰는 이미지 아카이브 갤러리',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-bg text-text min-h-screen">{children}</body>
    </html>
  );
}
