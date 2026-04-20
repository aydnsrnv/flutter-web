import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = 'https://jobly.az';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/login',
        '/signup',
        '/logout',
        '/me',
        '/payment',
        '/reset-password',
        '/forgot-password',
      ],
    },
    sitemap: `${base.replace(/\/$/, '')}/sitemap.xml`,
    host: base.replace(/\/$/, ''),
  };
}
