import { NextResponse } from 'next/server'
import { getSearchIndex } from '@/lib/queries'

// Read-only. The command search fetches this once, the first time it opens.
export const revalidate = 300

export async function GET() {
  const index = await getSearchIndex()
  return NextResponse.json(index)
}
