import Link from "next/link"
import BackHome from "@/components/back-home"
import NetworkArt from "@/components/network-art"
import { SITE_NAME } from "@/lib/site"

export const metadata = {
  title: `Nodo — ${SITE_NAME}`,
  description:
    "Nodo is the agent societies research direction at Emiliano's Lab, studying trust, alliances, voting, and cooperation among artificial agents.",
}

export default function NodoPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="site-wrap">
        <div className="pt-12 md:pt-16"><BackHome /></div>
        <section className="grid items-center gap-10 py-20 md:grid-cols-[1.08fr_1fr] md:gap-14 md:py-28">
          <div>
            <h1 className="text-[clamp(3.5rem,8vw,6.4rem)] font-medium leading-[.98] tracking-[-.065em]">
              Nodo<span className="text-accent">.</span>
            </h1>
            <p className="mt-7 max-w-sm text-base leading-relaxed text-muted-foreground md:text-lg">
              A subsection of my research focused on artificial agents and their impact on society.
            </p>
          </div>
          <div className="mx-auto w-full max-w-[510px] py-4 md:py-0"><NetworkArt /></div>
        </section>

        <section className="pb-24 md:pb-36" aria-labelledby="nodo-index">
          <h2 id="nodo-index" className="mb-7 text-3xl font-normal tracking-[-.035em] md:text-4xl">Experiments</h2>
          <div className="flex min-h-20 items-center justify-between gap-6 py-5">
            <div className="flex min-w-0 items-center gap-5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              <a href="/nodo/voting/report.html" className="text-base font-medium tracking-tight hover:text-accent sm:text-lg">
                Voting societies: two endings ↗
              </a>
            </div>
            <nav aria-label="Report language" className="flex shrink-0 gap-4 text-xs text-muted-foreground sm:text-sm">
              <a href="/nodo/voting/report.html" className="hover:text-accent">EN</a>
              <a href="/nodo/voting/report.es.html" className="hover:text-accent">ES</a>
            </nav>
          </div>
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="site-wrap flex items-center justify-between gap-4 py-8 text-sm">
          <Link href="/" className="hover:text-accent">← {SITE_NAME}</Link>
          <span className="text-muted-foreground">Nodo</span>
        </div>
      </footer>
    </div>
  )
}
