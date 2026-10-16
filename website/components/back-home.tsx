import Link from "next/link"

export default function BackHome() {
  return (
    <Link
      href="/"
      aria-label="Back to homepage"
      className="-ml-2 inline-flex h-10 w-10 items-center justify-center text-2xl font-light text-muted-foreground transition-colors hover:text-accent"
    >
      ←
    </Link>
  )
}
