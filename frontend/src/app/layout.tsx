import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { ToastProvider } from '@/contexts/ToastContext';

export const metadata: Metadata = {
  title: 'Umurava AI - AI Powered Recruitment Platform',
  description: 'AI-powered recruitment platform connecting talent with opportunities in Africa',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/hire me.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
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
          <LoadingProvider>
            <ToastProvider>{children}</ToastProvider>
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
