import type { Metadata, Viewport } from 'next';
import { ToastContainer } from 'react-compact-toast';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'React Compact Toast',
  description:
    'A tiny, compact, and fully customizable toast notification library.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {/*
          Rendered from a server component: props stay serializable.
          The stylesheet is imported into a cascade layer in globals.css so
          Tailwind utilities can override it, hence `injectStyles={false}`.
        */}
        <ToastContainer injectStyles={false} />
      </body>
    </html>
  );
}
