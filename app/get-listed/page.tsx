import { buildMetadata } from '@/lib/seo'
import { GetListedView } from '@/components/getlisted/GetListedView'

export const metadata = buildMetadata({
  title: 'Get your AI tool listed — Bohemo',
  description:
    'Listing on Bohemo is free. Submit your AI tool, and an editor reviews it and writes the tool page. Paying never changes a Local Fit score.',
  path: '/get-listed',
})

export default function GetListedPage() {
  return <GetListedView />
}
