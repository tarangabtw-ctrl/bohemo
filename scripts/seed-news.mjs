/**
 * One-shot script: insert the 5 seed news articles into Supabase.
 * Run with:  node scripts/seed-news.mjs
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// Parse .env.local manually (no dotenv dep needed)
const env = {}
try {
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .forEach((line) => {
      const match = line.match(/^([^#=\s]+)\s*=\s*(.*)$/)
      if (match) env[match[1]] = match[2].trim()
    })
} catch {
  // fall through — vars may already be in process.env
}

const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('❌  Missing env vars.')
  console.error('   NEXT_PUBLIC_SUPABASE_URL  — your project URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY — Supabase dashboard → Settings → API → service_role (secret)')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
})

const articles = [
  {
    title: "India's AI Startup Ecosystem Surpasses $2 Billion in Funding in 2024",
    excerpt:
      "Indian AI startups raised over $2B last year as global investors double down on the country's engineering talent and growing enterprise AI demand. Key sectors include healthtech, fintech, and edtech AI applications.",
    url: 'https://techcrunch.com',
    source: 'TechCrunch India',
    category: 'Funding',
    region: 'India',
    published_at: '2024-12-10T09:00:00Z',
    created_at: '2024-12-10T09:00:00Z',
  },
  {
    title: 'Singapore Unveils National AI Strategy 2.0 with $1 Billion Investment',
    excerpt:
      'The Singapore government announced NAS 2.0, a $1B commitment to accelerate AI adoption across public services, manufacturing, and finance. The plan focuses on developing AI talent and regulatory frameworks for Southeast Asia.',
    url: 'https://straitstimes.com',
    source: 'The Straits Times',
    category: 'Policy',
    region: 'Singapore',
    published_at: '2024-12-05T06:00:00Z',
    created_at: '2024-12-05T06:00:00Z',
  },
  {
    title: 'Generative AI Adoption Among Southeast Asian SMEs Triples in 2024',
    excerpt:
      'A new Tech in Asia report reveals SME adoption of generative AI tools has tripled year-on-year across Vietnam, Thailand, and the Philippines. Customer service chatbots and content creation tools lead the surge.',
    url: 'https://techinasia.com',
    source: 'Tech in Asia',
    category: 'Business',
    region: 'Southeast Asia',
    published_at: '2024-12-02T08:00:00Z',
    created_at: '2024-12-02T08:00:00Z',
  },
  {
    title: "IIT Madras Launches India's First Dedicated AI-Only Research Campus",
    excerpt:
      'IIT Madras inaugurated a 10-acre AI research campus focused on foundation models, AI safety, and regional language AI. The institute plans to train 5,000 AI researchers over five years with industry partnerships.',
    url: 'https://thehindu.com',
    source: 'The Hindu',
    category: 'Education',
    region: 'India',
    published_at: '2024-11-28T07:30:00Z',
    created_at: '2024-11-28T07:30:00Z',
  },
  {
    title: "Indonesia's GoTo and Grab Race to Embed AI Across Their Super Apps",
    excerpt:
      "Southeast Asia's two biggest super apps are in an AI arms race — integrating LLM-powered features into ride-hailing, food delivery, and financial services. Both companies are hiring aggressively from local universities.",
    url: 'https://restofworld.org',
    source: 'Rest of World',
    category: 'Business',
    region: 'Indonesia',
    published_at: '2024-11-20T10:00:00Z',
    created_at: '2024-11-20T10:00:00Z',
  },
]

console.log(`🔗  Connecting to ${url}`)
console.log(`📰  Upserting ${articles.length} news articles (on conflict: url)…\n`)

const { data, error } = await supabase
  .from('news')
  .upsert(articles, { onConflict: 'url', ignoreDuplicates: false })
  .select('title, region')

if (error) {
  console.error('❌  Supabase error:', error.message)
  console.error(error)
  process.exit(1)
}

console.log('✅  Upserted articles:')
data?.forEach((a) => console.log(`   • [${a.region}] ${a.title}`))
console.log('\nDone.')
