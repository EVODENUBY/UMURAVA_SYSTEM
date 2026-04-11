import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoadingProvider } from '@/contexts/LoadingContext';

export const metadata: Metadata = {
  title: 'Umurava AI - AI Powered Recruitment Platform',
  description: 'AI-powered recruitment platform connecting talent with opportunities in Africa',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="m-0 p-0">
        <AuthProvider>
          <LoadingProvider>{children}</LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
