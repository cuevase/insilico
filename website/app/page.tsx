import Link from "next/link"
import NetworkArt from "@/components/network-art"
import ExperimentCard from "@/components/experiment-card"
import ScrollReveal from "@/components/scroll-reveal"
import { SITE_NAME } from "@/lib/site"
import { experiments, getPinnedExperiments, withoutPinned } from "@/lib/experiments"

const orderedExperiments = [
  ...getPinnedExperiments(),
  ...withoutPinned(experiments.filter((e) => e.status === "completed")),
  ...withoutPinned(experiments.filter((e) => e.status !== "completed")),
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="site-wrap">
        <section className="grid min-h-[100svh] items-center gap-10 py-12 md:grid-cols-[1.08fr_1fr] md:gap-14 md:py-16">
          <h1 className="text-[clamp(3.2rem,7.5vw,6.4rem)] font-medium leading-[.98] tracking-[-.065em]">
            Emiliano&apos;s<br />Lab<span className="text-accent">.</span>
          </h1>
          <div className="mx-auto w-full max-w-[510px] py-4 md:py-0"><NetworkArt /></div>
        </section>

        <ScrollReveal>
          <Link href="/nodo" className="group flex min-h-20 items-center justify-between gap-6 py-5 transition-colors hover:text-accent">
            <div className="flex items-center gap-5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              <span className="text-base font-medium tracking-tight sm:text-lg">Nodo — agent societies</span>
            </div>
          </Link>
          {orderedExperiments.map((exp) => <ExperimentCard key={exp.slug} experiment={exp} />)}
        </ScrollReveal>
      </main>
      <footer className="border-t border-border">
        <div className="site-wrap flex flex-wrap items-center justify-between gap-4 py-8 text-sm">
          <span className="text-muted-foreground">{SITE_NAME}</span>
          <nav aria-label="Footer navigation" className="flex items-center gap-6">
            <Link href="/about" className="hover:text-accent">About ↗</Link>
            <Link href="/contact" className="hover:text-accent">Contact ↗</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
