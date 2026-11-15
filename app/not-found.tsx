import Link from 'next/link'

export default function NotFound() {
  return (
    <div>
      <h1>Page not found.</h1>
      <Link href="/">Go back</Link>
    </div>
  )
}
