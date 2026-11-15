import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Temporary: while the v2 redesign is in progress, every page except the
// homepage redirects (307, temporary) to the coming-soon page at "/".
// API routes, Next.js assets, static files and SEO files are untouched.
// Delete this file when redesign/v2 is merged.
export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL('/', request.url), 307)
}

export const config = {
  matcher: ['/((?!api/|_next/|assets/|favicon|robots\\.txt|sitemap\\.xml).+)'],
}
