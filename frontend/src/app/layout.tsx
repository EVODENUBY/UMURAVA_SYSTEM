import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Umurava AI - AI Powered Recruitment Platform',
  description: 'AI-powered recruitment platform connecting talent with opportunities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}