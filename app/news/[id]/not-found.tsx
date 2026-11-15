import Link from 'next/link'

export default function NotFound() {
  return (
    <div>
      <h1>Story not found.</h1>
      <Link href="/news">Go back</Link>
    </div>
  )
}
