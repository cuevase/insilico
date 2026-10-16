import Link from "next/link"
import Navbar from "@/components/navbar"
import ExperimentCard from "@/components/experiment-card"
import { experiments, getPinnedExperiments, withoutPinned } from "@/lib/experiments"
import { SITE_NAME } from "@/lib/site"

export const metadata = {
  title: `Experiments — ${SITE_NAME}`,
  description:
    "Experiments in intelligence and behavior, from neuroscience and EEG to evolutionary simulation and artificial agent societies.",
}

const orderedExperiments = [
  ...getPinnedExperiments(),
  ...withoutPinned(experiments.filter((e) => e.status === "completed")),
  ...withoutPinned(experiments.filter((e) => e.status !== "completed")),
]

export default function ExperimentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="site-wrap py-20 md:py-28">
        <h1 className="mb-12 text-5xl font-medium tracking-[-.05em] md:text-6xl">Experiments</h1>
        <div className="border-t border-foreground">
          <Link href="/nodo" className="group flex min-h-20 items-center justify-between gap-6 border-b border-border py-5 transition-colors hover:text-accent">
            <div className="flex items-center gap-5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              <h2 className="text-base font-medium tracking-tight sm:text-lg">Nodo — agent societies</h2>
            </div>
            <span className="text-lg text-muted-foreground transition-colors group-hover:text-accent" aria-hidden="true">↗</span>
          </Link>
          {orderedExperiments.map((exp) => <ExperimentCard key={exp.slug} experiment={exp} />)}
        </div>
      </main>
    </div>
  )
}
