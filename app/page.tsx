import Link from 'next/link'

const CATEGORIES = ['Writing', 'Code', 'Design', 'Video', 'Research', 'Productivity', 'Marketing']

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center py-28 gap-6">
        <span className="pill-outline text-xs tracking-wide">
          Now building in public
        </span>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-ink leading-none max-w-3xl">
          The AI intelligence layer the Global South deserves.
        </h1>

        <p className="text-base sm:text-lg text-muted max-w-xl leading-relaxed">
          Discover tools. Read the news. Find agents. All in one place — built for India and
          Southeast Asia, not Silicon Valley.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link
            href="/tools"
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-secondary transition-colors"
          >
            Browse AI tools
          </Link>
          <Link
            href="/news"
            className="rounded-full border border-[rgba(13,13,13,0.20)] px-6 py-3 text-sm font-semibold text-ink hover:bg-cream-dark transition-colors"
          >
            Read the news
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="rounded-2xl bg-cream-mid border border-[rgba(13,13,13,0.08)] px-6 py-5 mb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { stat: '850M+', label: 'Internet users in India' },
            { stat: '460M+', label: 'Internet users in SEA' },
            { stat: '0',     label: 'Dedicated AI media outlets for them' },
            { stat: 'bohemo.', label: 'Changing that.' },
          ].map(({ stat, label }) => (
            <div key={stat} className="flex flex-col gap-1">
              <span className="text-xl font-black text-ink">{stat}</span>
              <span className="text-xs text-muted">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Platform cards */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            One platform. Everything AI.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: '🗂',
              title: 'AI Tools Directory',
              desc: 'The Michelin Guide of AI — curated tools with honest ratings, region-specific notes, and verified quality.',
              status: 'Live now',
              href: '/tools',
              cta: 'Browse tools',
            },
            {
              icon: '📡',
              title: 'AI News Feed',
              desc: 'Daily AI news filtered for what actually matters to India and Southeast Asia — no Silicon Valley echo chamber.',
              status: 'Live now',
              href: '/news',
              cta: 'Read news',
            },
          ].map((card) => (
            <div key={card.title} className="card-hover flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{card.icon}</span>
                <span className="pill bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                  {card.status}
                </span>
              </div>
              <h3 className="font-semibold text-base text-ink">{card.title}</h3>
              <p className="text-sm text-muted leading-relaxed flex-1">{card.desc}</p>
              <Link
                href={card.href}
                className="self-start rounded-full border border-[rgba(13,13,13,0.20)] px-4 py-1.5 text-xs font-medium text-ink hover:bg-ink hover:text-cream transition-colors"
              >
                {card.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Category pills */}
      <section className="mb-20 text-center">
        <p className="text-sm text-muted mb-4">Browse by category</p>
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/tools?category=${cat}`}
              className="pill-outline hover:bg-ink hover:text-cream hover:border-ink transition-colors text-sm"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
