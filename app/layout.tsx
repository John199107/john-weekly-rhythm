import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'John · AI成长与自媒体每周节奏',
  description: '工作、家庭、AI成长与自媒体的轻量每周计划。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
