import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-serif text-lg font-medium text-foreground tracking-tight hover:opacity-80 transition-opacity"
        >
          insilico
        </Link>
        <nav className="flex items-center gap-7">
          <Link
            href="/about"
            className="text-sm text-[#6B6459] hover:text-foreground transition-colors"
          >
            About
          </Link>
          <a
            href="https://github.com/cuevase/insilico"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#6B6459] hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  )
}
