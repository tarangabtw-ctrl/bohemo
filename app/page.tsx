import type { Metadata } from 'next'
import { NewsletterForm } from '@/components/NewsletterForm'

// Temporary holding page while the v2 redesign is built on branch redesign/v2.
// Every other route redirects here via middleware.ts.
export const metadata: Metadata = {
  title: 'bohemo. — coming soon',
  description: 'AI tools and news for India and Southeast Asia. A new bohemo. is on the way.',
}

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <p className="text-3xl font-extrabold tracking-tight">bohemo.</p>
        <h1 className="mt-6 text-xl font-semibold">We&apos;re rebuilding.</h1>
        <p className="mt-2 text-base opacity-70">
          A new bohemo. is on the way. Get the newsletter and you&apos;ll hear first when it&apos;s live.
        </p>
        <div className="mt-8 text-left">
          <NewsletterForm />
        </div>
      </div>
    </main>
  )
}
