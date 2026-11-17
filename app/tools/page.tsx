import { getTools } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { ToolsDirectory } from '@/components/tools/ToolsDirectory'

// New tools can land at any time — avoid freezing this at build time.
export const revalidate = 60

export const metadata = buildMetadata({
  title: 'AI Tools Directory — Bohemo',
  description: 'The best AI tools for India and Southeast Asia, curated by category, use case, and price.',
  path: '/tools',
})

export default async function ToolsPage() {
  const tools = await getTools()
  return <ToolsDirectory tools={tools} />
}
