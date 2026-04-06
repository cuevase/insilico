import Link from 'next/link'
import { SITE_NAME } from '@/lib/site'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-serif text-lg font-medium text-foreground tracking-tight hover:opacity-80 transition-opacity"
        >
          {SITE_NAME}
        </Link>
        <nav className="flex items-center gap-7">
          <Link
            href="/experiments"
            className="text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            Experiments
          </Link>
          <Link
            href="/about"
            className="text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  )
}
