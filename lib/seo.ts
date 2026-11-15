import type { Metadata } from 'next'
import { SITE_URL, OG_IMAGE } from '@/lib/site'

interface PageMeta {
  title: string
  description: string
  /** Path starting with "/", used for the canonical URL. */
  path: string
  type?: 'website' | 'article'
  publishedTime?: string
}

/** Standard metadata (canonical, Open Graph, Twitter card) for any page. */
export function buildMetadata({ title, description, path, type = 'website', publishedTime }: PageMeta): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path === '/' ? '' : path}`,
      siteName: 'bohemo.',
      type,
      images: [OG_IMAGE],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
  }
}
