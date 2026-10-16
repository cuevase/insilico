import Link from "next/link"
import Navbar from "@/components/navbar"
import NetworkArt from "@/components/network-art"
import ExperimentCard from "@/components/experiment-card"
import { SITE_NAME } from "@/lib/site"
import { experiments, getPinnedExperiments, withoutPinned } from "@/lib/experiments"

const pinned = getPinnedExperiments()
const completed = withoutPinned(experiments.filter((e) => e.status === "completed"))
const upcoming = withoutPinned(experiments.filter((e) => e.status !== "completed"))

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="site-wrap">
        <section className="grid items-center gap-10 py-24 md:grid-cols-[1.08fr_1fr] md:gap-14 md:py-36">
          <h1 className="text-[clamp(3.2rem,7.5vw,6.4rem)] font-medium leading-[.98] tracking-[-.065em]">
            Emiliano&apos;s<br />Lab<span className="text-accent">.</span>
          </h1>
          <div className="mx-auto w-full max-w-[510px] py-4 md:py-0"><NetworkArt /></div>
        </section>

        <section className="pb-20 md:pb-28" aria-labelledby="featured-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="featured-title" className="text-3xl font-normal tracking-[-.035em] md:text-4xl">Featured experiments</h2>
            <Link href="/experiments" className="border-b border-foreground pb-1 text-sm transition-colors hover:border-accent hover:text-accent">View all experiments ↗</Link>
          </div>
          <div className="mt-8 border-t border-foreground">
            <Link href="/nodo" className="group flex min-h-20 items-center justify-between gap-6 border-b border-border py-5 transition-colors hover:text-accent">
              <div className="flex items-center gap-5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <h3 className="text-base font-medium tracking-tight sm:text-lg">Nodo — agent societies</h3>
              </div>
              <span className="text-lg text-muted-foreground transition-colors group-hover:text-accent" aria-hidden="true">↗</span>
            </Link>
            {pinned.map((exp) => <ExperimentCard key={exp.slug} experiment={exp} />)}
          </div>
        </section>

        {completed.length > 0 && (
          <section className="pb-20 md:pb-28" aria-labelledby="completed-title">
            <h2 id="completed-title" className="mb-7 text-2xl font-normal tracking-tight md:text-3xl">More completed work</h2>
            <div className="border-t border-foreground">
              {completed.map((exp) => <ExperimentCard key={exp.slug} experiment={exp} />)}
            </div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section className="pb-20 md:pb-28" aria-labelledby="upcoming-title">
            <h2 id="upcoming-title" className="mb-7 text-2xl font-normal tracking-tight md:text-3xl">Upcoming</h2>
            <div className="border-t border-foreground">
              {upcoming.map((exp) => <ExperimentCard key={exp.slug} experiment={exp} />)}
            </div>
          </section>
        )}
      </main>
      <footer className="border-t border-border">
        <div className="site-wrap flex items-center justify-between gap-4 py-8 text-sm">
          <span className="text-muted-foreground">{SITE_NAME}</span>
          <Link href="/contact" className="hover:text-accent">Contact ↗</Link>
        </div>
      </footer>
    </div>
  )
}
