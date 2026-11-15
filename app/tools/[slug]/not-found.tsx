import Link from 'next/link'

export default function NotFound() {
  return (
    <div>
      <h1>Tool not found.</h1>
      <Link href="/tools">Go back</Link>
    </div>
  )
}
