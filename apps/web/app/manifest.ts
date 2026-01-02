import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HomeDock',
    short_name: 'HomeDock',
    description: 'Home server dashboard for ports, subdomains, and services.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0f16',
    theme_color: '#0b0f16',
    icons: [
      {
        src: '/icons/favicon.svg',
        sizes: '512x512',
        type: 'image/svg+xml'
      },
      {
        src: '/icons/favicon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable'
      }
    ]
  };
}
