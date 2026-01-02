import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'HomeDock',
    template: '%s | HomeDock'
  },
  description: 'Home server dashboard for ports, subdomains, and services.',
  applicationName: 'HomeDock',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icons/favicon.svg', type: 'image/svg+xml' }]
  },
  openGraph: {
    type: 'website',
    siteName: 'HomeDock',
    title: 'HomeDock',
    description: 'Home server dashboard for ports, subdomains, and services.',
    url: '/'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HomeDock',
    description: 'Home server dashboard for ports, subdomains, and services.'
  },
  appleWebApp: {
    capable: true,
    title: 'HomeDock',
    statusBarStyle: 'black-translucent'
  },
  themeColor: '#0b0f16'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
