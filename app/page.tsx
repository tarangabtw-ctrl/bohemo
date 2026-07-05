import Script from 'next/script'
import Link from 'next/link'
import { HomeNav } from '@/components/HomeNav'
import { NewsletterForm } from '@/components/NewsletterForm'
import { supabase } from '@/lib/supabase'
import { truncate, formatRelativeTime } from '@/lib/utils'
import { SITE_URL } from '@/lib/site'
import type { Tool, NewsArticle } from '@/types'
import type { Metadata } from 'next'

const HOME_TITLE = 'bohemo. — AI tools & news for India and Southeast Asia'
const HOME_DESCRIPTION =
  'Discover the best AI tools and stay up to date with AI news — curated for India and Southeast Asia.'

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    siteName: 'bohemo.',
    type: 'website',
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'bohemo.',
  url: SITE_URL,
  description: HOME_DESCRIPTION,
}

type NewsHeadline = Pick<NewsArticle, 'title' | 'source' | 'published_at' | 'url'>

async function getToolOfWeek(): Promise<Tool | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) return null
  return data[0] as Tool
}

async function getLatestNews(): Promise<NewsHeadline[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('news')
    .select('title, source, published_at, url')
    .order('published_at', { ascending: false })
    .limit(3)

  if (error || !data) return []
  return data as NewsHeadline[]
}

export default async function HomePage() {
  const [tool, news] = await Promise.all([getToolOfWeek(), getLatestNews()])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* PostHog analytics */}
      <Script
        id="posthog-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.people.toString(1)+" stub"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init('phc_pXLMGWEYwx2MY9KBZLowf8LnzcfFfsSdSGdCoXDjWZc5',{api_host:'https://app.posthog.com'})`,
        }}
      />

      {/* NAV */}
      <HomeNav />

      {/* HERO */}
      <div className="hero" id="home">
        <div className="hero-ring" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Now building in public
          </div>
          <div className="hero-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/banner.png" alt="bohemo." />
          </div>
          <div className="hero-tagline-pill">an AI ecosystem and marketplace</div>
          <h1 className="hero-headline">
            The AI intelligence layer<br />the Global South deserves.
          </h1>
          <p className="hero-sub">
            Discover tools. Read the news. Find agents. All in one place — built for India and
            Southeast Asia, not Silicon Valley.
          </p>
          <div className="hero-actions">
            <a href="#newsletter" className="btn-primary">
              Join the waitlist
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 7h8M8 4l3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a href="#platform" className="btn-secondary">See what&apos;s coming</a>
          </div>
        </div>
      </div>

      {/* PROOF BAR */}
      <div className="proof-bar">
        <div className="proof-item">
          <span className="proof-number">850M+</span>
          <span className="proof-label">Internet users in India</span>
        </div>
        <div className="proof-divider" />
        <div className="proof-item">
          <span className="proof-number">460M+</span>
          <span className="proof-label">Internet users in SEA</span>
        </div>
        <div className="proof-divider" />
        <div className="proof-item">
          <span className="proof-number">0</span>
          <span className="proof-label">Dedicated AI media outlets for them</span>
        </div>
        <div className="proof-divider" />
        <div className="proof-item">
          <span className="proof-number">bohemo.</span>
          <span className="proof-label">Changing that.</span>
        </div>
      </div>

      {/* PLATFORM */}
      <section id="platform">
        <div className="section-label">What we&apos;re building</div>
        <h2 className="section-title">
          One platform.<br />Everything AI.
        </h2>
        <p className="section-body">
          Not another newsletter. Not another tools list. A fully integrated ecosystem — the
          Bloomberg of AI for the world&apos;s next billion builders.
        </p>

        <div className="platform-grid">
          <div className="platform-card">
            <div className="platform-card-icon">🗂</div>
            {tool ? (
              <>
                <span className="platform-card-tag live" style={{ marginTop: 0, marginBottom: '12px' }}>
                  Tool of the week
                </span>
                <div className="platform-card-title">{tool.name}</div>
                <p className="platform-card-body">{truncate(tool.description, 120)}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <span className="tool-pill" style={{ cursor: 'default' }}>{tool.category}</span>
                  {tool.price_label && (
                    <span className="tool-pill" style={{ cursor: 'default' }}>{tool.price_label}</span>
                  )}
                </div>
                <Link href="/tools" className="platform-card-tag" style={{ display: 'inline-block' }}>
                  Explore tools →
                </Link>
              </>
            ) : (
              <>
                <div className="platform-card-title">AI Tools Directory</div>
                <p className="platform-card-body">
                  A curated, opinionated catalog of the best AI tools by category, use case, and price.
                  Not every tool — the right tools. The Michelin Guide of AI.
                </p>
                <span className="platform-card-tag live">Launching soon</span>
              </>
            )}
          </div>
          <div className="platform-card">
            <div className="platform-card-icon">📡</div>
            {news.length > 0 ? (
              <>
                <span className="platform-card-tag live" style={{ marginTop: 0, marginBottom: '12px' }}>
                  Latest
                </span>
                <div className="platform-card-title">AI News Feed</div>
                <div style={{ marginTop: '4px', marginBottom: '16px' }}>
                  {news.map((item) => (
                    <div key={item.url} className="platform-news-item">
                      <div className="platform-news-title">{item.title}</div>
                      <div className="platform-news-meta">
                        {item.source} · {formatRelativeTime(item.published_at)}
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/news" className="platform-card-tag" style={{ display: 'inline-block' }}>
                  Read more →
                </Link>
              </>
            ) : (
              <>
                <div className="platform-card-title">AI News Feed</div>
                <p className="platform-card-body">
                  Curated AI news with an explicit India and Southeast Asia lens. The stories that
                  matter to builders where you are, not where the journalists are.
                </p>
                <span className="platform-card-tag live">Launching soon</span>
              </>
            )}
          </div>
          <div className="platform-card">
            <div className="platform-card-icon">⚡</div>
            <div className="platform-card-title">AI Agents Marketplace</div>
            <p className="platform-card-body">
              Discover, compare, and deploy AI agents for real workflows. Curated, tested, and
              certified — because a &quot;Bohemo Verified&quot; badge will mean something. A sea of
              untested agents deserves a trusted filter.
            </p>
            <span className="platform-card-tag">Coming later</span>
          </div>
        </div>
      </section>

      {/* WHY */}
      <div className="why-section" style={{ padding: '0 48px' }}>
        <div className="why-inner">
          <div className="why-left">
            <div className="section-label">Why it matters</div>
            <h2 className="why-title">
              The Bloomberg-for-AI seat in emerging markets is empty.
            </h2>
            <p className="why-body">
              Western AI media covers AI through a US and EU lens. Indian tech media covers
              startups but not tools deeply. Product Hunt is geographically agnostic and
              overwhelmed. The canonical, trusted AI intelligence destination for India and SEA
              doesn&apos;t exist yet.
            </p>
            <br />
            <p className="why-body">Until now.</p>
          </div>
          <div className="why-stats">
            <div className="why-stat">
              <div className="why-stat-number">1.3B+</div>
              <div className="why-stat-label">
                People in India &amp; SEA with no dedicated AI media
              </div>
            </div>
            <div className="why-stat">
              <div className="why-stat-number">1000s</div>
              <div className="why-stat-label">
                New AI tools launched every month with zero curation
              </div>
            </div>
            <div className="why-stat">
              <div className="why-stat-number">0</div>
              <div className="why-stat-label">
                Behavioral datasets on AI adoption in the Global South
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="tools">
        <div className="section-label">How it works</div>
        <h2 className="section-title">From discovery to intelligence.</h2>
        <p className="section-body">Three simple steps that turn chaos into clarity.</p>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">Step 01</div>
            <div className="step-title">Discover the right tool</div>
            <p className="step-body">
              Filter by task, price, and use case. No scrolling through 10,000 mediocre options.
              Just the best tools for what you actually need to build.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">Step 02</div>
            <div className="step-title">Stay informed daily</div>
            <p className="step-body">
              Read the AI news that matters — curated with a non-Western perspective. Know
              what&apos;s shipping, what&apos;s dying, and what&apos;s about to matter in your
              market.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">Step 03</div>
            <div className="step-title">Go deeper every week</div>
            <p className="step-body">
              The weekly newsletter is your AI intelligence digest — analysis, tool picks, and
              emerging market breakdowns that don&apos;t exist anywhere else.
            </p>
          </div>
        </div>

        <div className="tools-row">
          <a href="#" className="tool-pill">
            <span className="tool-pill-dot" style={{ background: '#0D0D0D' }} />
            Writing &amp; Content
          </a>
          <a href="#" className="tool-pill">
            <span className="tool-pill-dot" style={{ background: '#0D0D0D' }} />
            Code &amp; Dev
          </a>
          <a href="#" className="tool-pill">
            <span className="tool-pill-dot" style={{ background: '#0D0D0D' }} />
            Design &amp; Image
          </a>
          <a href="#" className="tool-pill">
            <span className="tool-pill-dot" style={{ background: '#0D0D0D' }} />
            Video &amp; Audio
          </a>
          <a href="#" className="tool-pill">
            <span className="tool-pill-dot" style={{ background: '#0D0D0D' }} />
            Research
          </a>
          <a href="#" className="tool-pill">
            <span className="tool-pill-dot" style={{ background: '#0D0D0D' }} />
            Productivity
          </a>
          <a href="#" className="tool-pill">
            <span className="tool-pill-dot" style={{ background: '#0D0D0D' }} />
            Marketing
          </a>
          <a href="#" className="tool-pill" style={{ opacity: 0.5, cursor: 'default' }}>
            + More coming
          </a>
        </div>
      </section>

      {/* FLYWHEEL */}
      <div className="flywheel-section">
        <div className="flywheel-inner">
          <div>
            <div className="section-label">The system</div>
            <h2 className="section-title">
              Not a product.<br />A flywheel.
            </h2>
            <p className="section-body" style={{ marginBottom: '40px' }}>
              Five layers that reinforce each other — media, agency, platform, newsletter, and
              eventually SaaS. Each one makes the others stronger.
            </p>

            <ul className="flywheel-list">
              <li className="flywheel-item">
                <span className="flywheel-item-num">01</span>
                <div>
                  <div className="flywheel-item-title">Personal brand builds audience</div>
                  <p className="flywheel-item-body">
                    A 16-year-old founder building the most ambitious AI platform in India, in
                    public. The story writes itself.
                  </p>
                </div>
              </li>
              <li className="flywheel-item">
                <span className="flywheel-item-num">02</span>
                <div>
                  <div className="flywheel-item-title">Agency generates cash and insight</div>
                  <p className="flywheel-item-body">
                    Marketing for US AI SaaS founders funds the platform and reveals the pain
                    points that become the future SaaS product.
                  </p>
                </div>
              </li>
              <li className="flywheel-item">
                <span className="flywheel-item-num">03</span>
                <div>
                  <div className="flywheel-item-title">Platform captures behavioral data</div>
                  <p className="flywheel-item-body">
                    Every tool discovery, every search query — a behavioral dataset on AI adoption
                    in India and SEA that doesn&apos;t exist anywhere else.
                  </p>
                </div>
              </li>
              <li className="flywheel-item">
                <span className="flywheel-item-num">04</span>
                <div>
                  <div className="flywheel-item-title">SaaS launches into a captive audience</div>
                  <p className="flywheel-item-body">
                    When the product ships in Year 3, it sells itself to an audience that already
                    trusts the brand. Near-zero CAC.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="flywheel-diagram">
            <div className="flywheel-ring flywheel-ring-1" />
            <div className="flywheel-ring flywheel-ring-2" />
            <div className="flywheel-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/logo.png" alt="bohemo." />
              <div className="flywheel-center-label">bohemo.</div>
            </div>
            <div className="flywheel-node fn-top">Media</div>
            <div className="flywheel-node fn-right">Agency</div>
            <div className="flywheel-node fn-bottom">SaaS</div>
            <div className="flywheel-node fn-left">Data</div>
          </div>
        </div>
      </div>

      {/* NEWSLETTER */}
      <div className="newsletter-section" id="newsletter" style={{ paddingTop: '96px' }}>
        <div className="newsletter-card">
          <div>
            <div className="section-label">Stay in orbit</div>
            <h2 className="newsletter-title">
              AI intelligence, every week.<br />No hype. No noise.
            </h2>
            <p className="newsletter-body">
              The bohemo. newsletter curates the tools, news, and analysis that matter to builders
              in India and Southeast Asia. Authoritative. Direct. Unmissable.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <a href="/" className="footer-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="bohemo." style={{ height: '28px', width: 'auto' }} />
          <span className="footer-wordmark">bohemo.</span>
        </a>
        <ul className="footer-links">
          <li><Link href="/tools">Tools</Link></li>
          <li><Link href="/news">News</Link></li>
          <li><a href="#">Agents</a></li>
          <li><a href="#">Newsletter</a></li>
          <li><a href="#">Discord</a></li>
        </ul>
        <span className="footer-copy">© 2025 bohemo. All rights reserved.</span>
      </footer>
    </>
  )
}
