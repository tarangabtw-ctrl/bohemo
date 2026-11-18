import type { Metadata } from 'next'
import { getNews, getTools } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { SavedView } from '@/components/saved/SavedView'

export const revalidate = 60

// Personal page: saves live in this browser, so there's nothing for search engines here.
export const metadata: Metadata = {
  ...buildMetadata({
    title: 'Saved — Bohemo',
    description: 'The tools and stories you saved on Bohemo.',
    path: '/saved',
  }),
  robots: { index: false, follow: true },
}

export default async function SavedPage() {
  const [tools, stories] = await Promise.all([getTools(), getNews()])
  return <SavedView tools={tools} stories={stories} />
}
