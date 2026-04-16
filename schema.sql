-- bohemo database schema
-- Run this in your Supabase SQL editor: https://app.supabase.com → SQL Editor

-- ============================================================
-- Tables
-- ============================================================

CREATE TABLE tools (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  slug         TEXT        NOT NULL UNIQUE,
  description  TEXT,
  url          TEXT        NOT NULL,
  category     TEXT        NOT NULL,
  price_type   TEXT        NOT NULL CHECK (price_type IN ('free', 'freemium', 'paid', 'open-source')),
  price_label  TEXT,
  tags         TEXT[]      NOT NULL DEFAULT '{}',
  region_relevance TEXT[]  NOT NULL DEFAULT '{}',
  verified     BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE news (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT        NOT NULL,
  excerpt      TEXT,
  url          TEXT        NOT NULL,
  source       TEXT        NOT NULL,
  category     TEXT        NOT NULL,
  region       TEXT        NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscribers (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_tools_category   ON tools (category);
CREATE INDEX idx_tools_price_type ON tools (price_type);
CREATE INDEX idx_news_region      ON news (region);
CREATE INDEX idx_news_category    ON news (category);
CREATE INDEX idx_news_published   ON news (published_at DESC);

-- ============================================================
-- Row Level Security (enable after initial setup)
-- ============================================================

ALTER TABLE tools       ENABLE ROW LEVEL SECURITY;
ALTER TABLE news        ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Public read access for tools and news
CREATE POLICY "tools_public_read"  ON tools       FOR SELECT USING (true);
CREATE POLICY "news_public_read"   ON news        FOR SELECT USING (true);

-- Anyone can subscribe (insert only, no read of others)
CREATE POLICY "subscribers_insert" ON subscribers FOR INSERT WITH CHECK (true);

-- ============================================================
-- Seed data — 10 tools
-- ============================================================

INSERT INTO tools (name, slug, description, url, category, price_type, price_label, tags, region_relevance, verified) VALUES
(
  'ChatGPT', 'chatgpt',
  'The world''s most widely used AI assistant for writing, coding, analysis, and conversation. Natively supports Hindi, Tamil, Bahasa Indonesia, Tagalog, and 50+ other languages.',
  'https://chat.openai.com', 'Writing', 'freemium', 'Free / $20 mo',
  ARRAY['chatbot','writing','multilingual','openai','gpt-4'],
  ARRAY['India','Southeast Asia'], true
),
(
  'GitHub Copilot', 'github-copilot',
  'AI pair programmer trained on billions of lines of code. Suggests entire functions, fixes bugs, and writes tests directly in your IDE.',
  'https://github.com/features/copilot', 'Code', 'paid', '$10 / mo',
  ARRAY['coding','autocomplete','github','vscode','developer-tools'],
  ARRAY['India','Southeast Asia'], true
),
(
  'Midjourney', 'midjourney',
  'The gold standard in AI image generation. Create photorealistic or artistic visuals from text prompts via Discord. Used by designers and marketers across the region.',
  'https://midjourney.com', 'Design', 'paid', 'From $10 / mo',
  ARRAY['image-generation','art','design','discord','creative'],
  ARRAY['India','Southeast Asia'], true
),
(
  'Runway ML', 'runway-ml',
  'Next-generation AI video creation. Generate, edit, and transform video from text or images using Gen-2 and Gen-3 models.',
  'https://runwayml.com', 'Video', 'freemium', 'Free / from $15 mo',
  ARRAY['video-generation','gen-2','creative','editing','animation'],
  ARRAY['India','Southeast Asia'], true
),
(
  'Perplexity AI', 'perplexity-ai',
  'An AI-powered answer engine that searches the web and provides cited, up-to-date responses. Popular in Indian academic and research circles.',
  'https://perplexity.ai', 'Research', 'freemium', 'Free / $20 mo',
  ARRAY['search','research','citations','real-time','web-search'],
  ARRAY['India','Southeast Asia'], true
),
(
  'Notion AI', 'notion-ai',
  'AI writing assistant built natively into Notion. Draft documents, summarise meeting notes, brainstorm, and translate content within your workspace.',
  'https://notion.so/product/ai', 'Writing', 'freemium', '$10 / mo add-on',
  ARRAY['writing','productivity','notes','summarisation','workspace'],
  ARRAY['India','Southeast Asia'], false
),
(
  'Replit', 'replit',
  'AI-powered cloud IDE with Ghostwriter that helps you write, debug, and deploy code from any browser. Popular for learning to code in India.',
  'https://replit.com', 'Code', 'freemium', 'Free / from $7 mo',
  ARRAY['ide','cloud','coding','deployment','education'],
  ARRAY['India','Southeast Asia'], false
),
(
  'Canva AI', 'canva-ai',
  'Magic Studio brings AI-powered design to Canva — generate images from text, remove backgrounds, auto-resize, and translate designs. The most-used design tool across India and SEA.',
  'https://canva.com/ai-image-generator', 'Design', 'freemium', 'Free / from $15 mo',
  ARRAY['design','image-generation','templates','magic-studio','social-media'],
  ARRAY['India','Southeast Asia'], true
),
(
  'Synthesia', 'synthesia',
  'Create professional AI videos featuring realistic digital avatars — no camera, no studio. Used by enterprise L&D and marketing teams across India.',
  'https://synthesia.io', 'Video', 'paid', 'From $22 / mo',
  ARRAY['avatar','video-production','training','enterprise','text-to-video'],
  ARRAY['India'], false
),
(
  'Elicit', 'elicit',
  'AI research assistant that finds, summarises, and extracts data from academic papers. Searches millions of papers to answer research questions with citations.',
  'https://elicit.com', 'Research', 'freemium', 'Free / $10 mo',
  ARRAY['research','papers','academic','literature-review','citations'],
  ARRAY['India','Southeast Asia'], false
);

-- ============================================================
-- Seed data — 5 news articles
-- ============================================================

INSERT INTO news (title, excerpt, url, source, category, region, published_at) VALUES
(
  'India''s AI Startup Ecosystem Surpasses $2 Billion in Funding in 2024',
  'Indian AI startups raised over $2B last year as global investors double down on the country''s engineering talent and growing enterprise AI demand. Key sectors include healthtech, fintech, and edtech AI applications.',
  'https://techcrunch.com', 'TechCrunch India', 'Funding', 'India', '2024-12-10T09:00:00Z'
),
(
  'Singapore Unveils National AI Strategy 2.0 with $1 Billion Investment',
  'The Singapore government announced NAS 2.0, a $1B commitment to accelerate AI adoption across public services, manufacturing, and finance.',
  'https://straitstimes.com', 'The Straits Times', 'Policy', 'Singapore', '2024-12-05T06:00:00Z'
),
(
  'Generative AI Adoption Among Southeast Asian SMEs Triples in 2024',
  'A new Tech in Asia report reveals SME adoption of generative AI tools has tripled year-on-year across Vietnam, Thailand, and the Philippines.',
  'https://techinasia.com', 'Tech in Asia', 'Business', 'Southeast Asia', '2024-12-02T08:00:00Z'
),
(
  'IIT Madras Launches India''s First Dedicated AI-Only Research Campus',
  'IIT Madras inaugurated a 10-acre AI research campus focused on foundation models, AI safety, and regional language AI. Plans to train 5,000 researchers over five years.',
  'https://thehindu.com', 'The Hindu', 'Education', 'India', '2024-11-28T07:30:00Z'
),
(
  'Indonesia''s GoTo and Grab Race to Embed AI Across Their Super Apps',
  'Southeast Asia''s two biggest super apps are integrating LLM-powered features into ride-hailing, food delivery, and financial services.',
  'https://restofworld.org', 'Rest of World', 'Business', 'Indonesia', '2024-11-20T10:00:00Z'
);
