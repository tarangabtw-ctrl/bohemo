'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'
import Navbar from '@/components/Navbar'

// Project uses PostHog via CDN script (window.posthog); no React package needed.
// Loaded here (rather than per-page) so every route — not just the homepage — gets analytics.
const POSTHOG_INIT_SCRIPT = `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.people.toString(1)+" stub"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init('phc_pXLMGWEYwx2MY9KBZLowf8LnzcfFfsSdSGdCoXDjWZc5',{api_host:'https://app.posthog.com'})`

/**
 * Conditionally renders Navbar + footer only on non-homepage routes.
 * The homepage owns its full layout (nav, content, footer) directly in page.tsx.
 */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  const posthogScript = (
    <Script id="posthog-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: POSTHOG_INIT_SCRIPT }} />
  )

  if (isHome) {
    // Let the homepage render its own nav and footer
    return (
      <>
        {posthogScript}
        {children}
      </>
    )
  }

  return (
    <>
      {posthogScript}
      <Navbar />
      <main>{children}</main>
      <footer className="border-t border-[rgba(13,13,13,0.10)] py-8 mt-20">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-semibold tracking-tight">bohemo.</span>
          <div className="flex gap-6 text-sm text-muted">
            <a href="/tools" className="hover:text-ink transition-colors">Tools</a>
            <a href="/news" className="hover:text-ink transition-colors">News</a>
          </div>
          <p className="text-sm sm:text-xs text-muted">© 2025 bohemo. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
