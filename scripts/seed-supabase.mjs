/**
 * One-shot script: insert the 10 seed tools into Supabase.
 * Run with:  node scripts/seed-supabase.mjs
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
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
// Service role key bypasses RLS — required for server-side writes
const key = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('❌  Missing env vars.')
  console.error('   NEXT_PUBLIC_SUPABASE_URL  — your project URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY — from Supabase dashboard → Settings → API → service_role (secret)')
  process.exit(1)
}

const supabase = createClient(url, key)

const tools = [
  {
    name: 'ChatGPT',
    slug: 'chatgpt',
    description: "The world's most widely used AI assistant for writing, coding, analysis, and conversation. Natively supports Hindi, Tamil, Bahasa Indonesia, Tagalog, and 50+ other languages — making it one of the most accessible AI tools across India and Southeast Asia.",
    url: 'https://chat.openai.com',
    category: 'Writing',
    price_type: 'freemium',
    price_label: 'Free / $20 mo',
    tags: ['chatbot', 'writing', 'multilingual', 'openai', 'gpt-4'],
    region_relevance: ['India', 'Southeast Asia'],
    verified: true,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    name: 'GitHub Copilot',
    slug: 'github-copilot',
    description: 'AI pair programmer trained on billions of lines of code. Suggests entire functions, fixes bugs, and writes tests directly in your IDE. Heavily adopted by Indian engineering teams and SEA tech startups building fast.',
    url: 'https://github.com/features/copilot',
    category: 'Code',
    price_type: 'paid',
    price_label: '$10 / mo',
    tags: ['coding', 'autocomplete', 'github', 'vscode', 'developer-tools'],
    region_relevance: ['India', 'Southeast Asia'],
    verified: true,
    created_at: '2024-01-16T00:00:00Z',
  },
  {
    name: 'Midjourney',
    slug: 'midjourney',
    description: 'The gold standard in AI image generation. Create photorealistic or artistic visuals from text prompts via Discord. Used by designers, marketers, and creators across the region for campaigns, branding, and content.',
    url: 'https://midjourney.com',
    category: 'Design',
    price_type: 'paid',
    price_label: 'From $10 / mo',
    tags: ['image-generation', 'art', 'design', 'discord', 'creative'],
    region_relevance: ['India', 'Southeast Asia'],
    verified: true,
    created_at: '2024-01-17T00:00:00Z',
  },
  {
    name: 'Runway ML',
    slug: 'runway-ml',
    description: 'Next-generation AI video creation. Generate, edit, and transform video from text or images using Gen-2 and Gen-3 models. A go-to tool for video creators, ad agencies, and filmmakers across Asia.',
    url: 'https://runwayml.com',
    category: 'Video',
    price_type: 'freemium',
    price_label: 'Free / from $15 mo',
    tags: ['video-generation', 'gen-2', 'creative', 'editing', 'animation'],
    region_relevance: ['India', 'Southeast Asia'],
    verified: true,
    created_at: '2024-01-18T00:00:00Z',
  },
  {
    name: 'Perplexity AI',
    slug: 'perplexity-ai',
    description: 'An AI-powered answer engine that searches the web and provides cited, up-to-date responses. Ideal for researchers, students, and professionals who need accurate information fast — popular in Indian academic circles.',
    url: 'https://perplexity.ai',
    category: 'Research',
    price_type: 'freemium',
    price_label: 'Free / $20 mo',
    tags: ['search', 'research', 'citations', 'real-time', 'web-search'],
    region_relevance: ['India', 'Southeast Asia'],
    verified: true,
    created_at: '2024-01-19T00:00:00Z',
  },
  {
    name: 'Notion AI',
    slug: 'notion-ai',
    description: 'AI writing assistant built natively into Notion. Draft documents, summarise meeting notes, brainstorm ideas, and translate content — all within your existing workspace. Used widely by Indian and SEA startups.',
    url: 'https://notion.so/product/ai',
    category: 'Writing',
    price_type: 'freemium',
    price_label: '$10 / mo add-on',
    tags: ['writing', 'productivity', 'notes', 'summarisation', 'workspace'],
    region_relevance: ['India', 'Southeast Asia'],
    verified: false,
    created_at: '2024-01-20T00:00:00Z',
  },
  {
    name: 'Replit',
    slug: 'replit',
    description: 'AI-powered cloud IDE with a built-in AI model (Ghostwriter) that helps you write, debug, and deploy code from any browser. Hugely popular in India for learning to code and building side projects without local setup.',
    url: 'https://replit.com',
    category: 'Code',
    price_type: 'freemium',
    price_label: 'Free / from $7 mo',
    tags: ['ide', 'cloud', 'coding', 'deployment', 'education'],
    region_relevance: ['India', 'Southeast Asia'],
    verified: false,
    created_at: '2024-01-21T00:00:00Z',
  },
  {
    name: 'Canva AI',
    slug: 'canva-ai',
    description: 'Magic Studio brings AI-powered design to Canva — generate images from text, remove backgrounds instantly, auto-resize for every platform, and translate designs. Canva is the most-used design tool across India and SEA.',
    url: 'https://canva.com/ai-image-generator',
    category: 'Design',
    price_type: 'freemium',
    price_label: 'Free / from $15 mo',
    tags: ['design', 'image-generation', 'templates', 'magic-studio', 'social-media'],
    region_relevance: ['India', 'Southeast Asia'],
    verified: true,
    created_at: '2024-01-22T00:00:00Z',
  },
  {
    name: 'Synthesia',
    slug: 'synthesia',
    description: 'Create professional AI videos featuring realistic digital avatars — no camera, no studio, no actors. Widely used by enterprise L&D teams and marketing departments across India for training and product explainer videos.',
    url: 'https://synthesia.io',
    category: 'Video',
    price_type: 'paid',
    price_label: 'From $22 / mo',
    tags: ['avatar', 'video-production', 'training', 'enterprise', 'text-to-video'],
    region_relevance: ['India'],
    verified: false,
    created_at: '2024-01-23T00:00:00Z',
  },
  {
    name: 'Elicit',
    slug: 'elicit',
    description: 'AI research assistant that finds, summarises, and extracts data from academic papers. Designed for researchers and analysts, Elicit searches millions of papers to answer research questions with citations.',
    url: 'https://elicit.com',
    category: 'Research',
    price_type: 'freemium',
    price_label: 'Free / $10 mo',
    tags: ['research', 'papers', 'academic', 'literature-review', 'citations'],
    region_relevance: ['India', 'Southeast Asia'],
    verified: false,
    created_at: '2024-01-24T00:00:00Z',
  },
]

console.log(`🔗  Connecting to ${url}`)
console.log(`📦  Upserting ${tools.length} tools (on conflict: slug)…\n`)

const { data, error } = await supabase
  .from('tools')
  .upsert(tools, { onConflict: 'slug', ignoreDuplicates: false })
  .select('slug, name')

if (error) {
  console.error('❌  Supabase error:', error.message)
  console.error(error)
  process.exit(1)
}

console.log('✅  Upserted tools:')
data?.forEach((t) => console.log(`   • ${t.name}  (${t.slug})`))
console.log('\nDone.')
