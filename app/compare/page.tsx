import { getToolsBySlug } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { CompareView } from '@/components/tools/CompareView'

// Usage: /compare?tools=a,b,c (up to 3 slugs)
export const metadata = buildMetadata({
  title: 'Compare AI tools — Bohemo',
  description:
    'Compare AI tools side by side: Local Fit, prices, languages and payments, for India and Southeast Asia.',
  path: '/compare',
})

interface Props {
  searchParams: { tools?: string }
}

export default async function ComparePage({ searchParams }: Props) {
  const slugs = Array.from(
    new Set(
      (searchParams.tools ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ).slice(0, 3)
  const tools = await getToolsBySlug(slugs)
  return <CompareView tools={tools} />
}
