import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { SignInView } from '@/components/account/SignInView'

export const metadata: Metadata = {
  ...buildMetadata({
    title: 'Sign in — Bohemo',
    description: 'Sign in or sign up to Bohemo with an email link or Google. No passwords.',
    path: '/sign-in',
  }),
  robots: { index: false, follow: true },
}

export default function SignInPage() {
  return <SignInView />
}
