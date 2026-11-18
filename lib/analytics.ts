// PostHog is loaded via CDN script in components/PostHogScript.tsx (window.posthog).
// Call track() from client components only. Event names from v1 are kept so
// PostHog dashboards stay continuous across the redesign:
//   waitlist_click, search_query, newsletter_signup, tools_compare_view,
//   news_article_click, category_filtered, tools_filter_change,
//   news_filter_change, tool_clicked, tool_card_click, tool_viewed
// Never rename or remove those. v2 events, added alongside (SPEC.md Task 9):
//   market_selected        { market, previous, source: picker | onboarding }
//   task_search            { query, source: command | home, results }
//   task_result_click      { kind: task | tool | story, target, position, query, source }
//   tool_saved             { slug, saves }            (only when saving, not un-saving)
//   story_saved            { id, saves }
//   signup_from_saves      { method: email | google, saves }
//   compare_opened         { tools, count }
//   stack_cloned           (reserved: stacks can't be cloned yet, so nothing sends it)
//   edition_story_read     { id, edition_date, rank }
//   edition_completed      { edition_date, stories }   (once per edition per device)
//   newsletter_subscribed  { source: home | article | edition }
//   news_to_tool_click     { slug, story_id?, source: article | edition_rail }
//   tool_to_news_click     { slug, story_id }
//   checkout_started       { source, plan }  (opens the Pro waitlist until payments go live)
//   outbound_tool_click    { slug, source: tool_page | compare }

type PostHogWindow = Window & { posthog?: { capture: (event: string, props?: object) => void } }

export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  ;(window as PostHogWindow).posthog?.capture(event, props)
}
