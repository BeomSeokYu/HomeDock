import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import './globals.css';

const FALLBACK_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api';

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const fallbackUrl = new URL(FALLBACK_SITE_URL);
  const forwardedHost = headerList.get('x-forwarded-host');
  const host = forwardedHost ?? headerList.get('host');
  const forwardedProto = headerList.get('x-forwarded-proto');
  const protocol = forwardedProto ?? fallbackUrl.protocol.replace(':', '');
  const metadataBase = host
    ? new URL(`${protocol}://${host}`)
    : fallbackUrl;

  let dashboardTitle = 'HomeDock';
  let dashboardDescription =
    'Home server dashboard for ports, subdomains, and services.';

  try {
    const response = await fetch(`${API_BASE}/dashboard`, { cache: 'no-store' });
    if (response.ok) {
      const data = (await response.json()) as {
        config?: { tabTitle?: string; title?: string; description?: string };
      };
      const tabTitle = data?.config?.tabTitle?.trim();
      const title = data?.config?.title?.trim();
      const description = data?.config?.description?.trim();
      dashboardTitle = tabTitle || title || dashboardTitle;
      if (description) {
        dashboardDescription = description;
      }
    }
  } catch {
    // Fall back to defaults if the API is unreachable.
  }

  return {
    metadataBase,
    title: {
      default: dashboardTitle,
      template: `%s | ${dashboardTitle}`
    },
    description: dashboardDescription,
    applicationName: dashboardTitle,
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [{ url: '/icons/favicon.svg', type: 'image/svg+xml' }]
    },
    openGraph: {
      type: 'website',
      siteName: dashboardTitle,
      title: dashboardTitle,
      description: dashboardDescription,
      url: '/',
      images: ['/opengraph-image']
    },
    twitter: {
      card: 'summary_large_image',
      title: dashboardTitle,
      description: dashboardDescription,
      images: ['/twitter-image']
    },
    appleWebApp: {
      capable: true,
      title: dashboardTitle,
      statusBarStyle: 'black-translucent'
    }
  };
}

export const viewport: Viewport = {
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
