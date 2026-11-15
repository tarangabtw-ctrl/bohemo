// PostHog is loaded via CDN script in components/PostHogScript.tsx (window.posthog).
// Call track() from client components only. Event names from v1 are kept so
// PostHog dashboards stay continuous across the redesign:
//   waitlist_click, search_query, newsletter_signup, tools_compare_view,
//   news_article_click, category_filtered, tools_filter_change,
//   news_filter_change, tool_clicked, tool_card_click, tool_viewed

type PostHogWindow = Window & { posthog?: { capture: (event: string, props?: object) => void } }

export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  ;(window as PostHogWindow).posthog?.capture(event, props)
}
