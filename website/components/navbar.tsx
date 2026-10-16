import Link from 'next/link'
import { SITE_NAME } from '@/lib/site'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="site-wrap flex h-18 items-center justify-between gap-5 md:h-22">
        <Link href="/" aria-label={`${SITE_NAME}, home`} className="inline-flex items-center justify-center">
          <span className="h-[18px] w-[18px] shrink-0 rounded-full bg-accent" aria-hidden="true" />
        </Link>
        <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground sm:gap-7 sm:text-sm">
          <Link href="/experiments" className="transition-colors hover:text-foreground">Experiments</Link>
          <Link href="/nodo" className="transition-colors hover:text-foreground">Nodo</Link>
          <Link href="/about" className="hidden transition-colors hover:text-foreground sm:inline">About</Link>
          <Link href="/contact" className="hidden transition-colors hover:text-foreground sm:inline">Contact</Link>
        </nav>
      </div>
    </header>
  )
}
