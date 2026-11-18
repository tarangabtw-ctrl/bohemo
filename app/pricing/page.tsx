import { buildMetadata } from '@/lib/seo'
import { PricingView } from '@/components/pricing/PricingView'

export const metadata = buildMetadata({
  title: 'Pricing — Bohemo',
  description:
    'Bohemo is free to read. Pro adds watchlist alerts, the weekly market report and the full archive of The Signal, priced in rupees, GST included. Listing a tool is free.',
  path: '/pricing',
})

export default function PricingPage() {
  return <PricingView />
}
