import Link from "next/link"
import Navbar from "@/components/navbar"
import { SITE_NAME, TRIBE_V2_PUBLICATION_URL } from "@/lib/site"
import ExperimentCard from "@/components/experiment-card"
import {
  experiments,
  getPinnedExperiments,
  withoutPinned,
} from "@/lib/experiments"

const pinned = getPinnedExperiments()
const completed = withoutPinned(experiments.filter((e) => e.status === "completed"))
const planned = withoutPinned(
  experiments.filter((e) => e.status === "planned" || e.status === "running")
)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6">
        {/* Hero */}
        <div className="pt-24 pb-16">
          <h1 className="font-serif text-5xl font-medium text-foreground leading-tight tracking-tight text-balance mb-6 md:text-6xl">
            {SITE_NAME}
          </h1>
          <p className="text-lg text-foreground/85 leading-relaxed max-w-2xl mb-4">
            A home for neuroscience experiments on language, cognition, and perception: using
            both computational models and measured brain activity.
          </p>
          <p className="text-base text-foreground/85 leading-relaxed max-w-2xl">
            Built by{" "}
            <a
              href="https://linkedin.com/in/emiliano-cuevas-rodriguez-74538727b"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-medium underline underline-offset-4 hover:text-accent transition-colors"
            >
              Emiliano Cuevas
            </a>
            . Some studies are in silico: they use{" "}
            <a
              href={TRIBE_V2_PUBLICATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-accent transition-colors"
            >
              TRIBE v2
            </a>{" "}
            and related encoding models to predict cortical responses without a scanner. Others
            use empirical recordings like EEGs. Each experiment page states its methods.
          </p>
        </div>

        {/* Pinned experiments */}
        {pinned.length > 0 && (
          <section className="pb-12">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-5">
              Pinned experiments
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {pinned.map((exp) => (
                <ExperimentCard key={exp.slug} experiment={exp} pinned />
              ))}
            </div>
          </section>
        )}

        {/* Completed experiments */}
        {completed.length > 0 && (
          <section className="pb-12">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-5">
              Completed experiments
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {completed.map((exp) => (
                <ExperimentCard key={exp.slug} experiment={exp} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming experiments */}
        {planned.length > 0 && (
          <section className="pb-12">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-5">
              Upcoming experiments
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {planned.map((exp) => (
                <ExperimentCard key={exp.slug} experiment={exp} />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="border-t border-border pt-8 pb-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
            All experiments are designed and run by <a href="https://linkedin.com/in/emiliano-cuevas-rodriguez-74538727b" target="_blank" rel="noopener noreferrer" className="text-foreground/85 hover:text-accent transition-colors underline underline-offset-4">Emiliano Cuevas</a>.
            Not for clinical use.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/experiments"
              className="text-sm text-foreground/85 hover:text-accent transition-colors"
            >
              All experiments
            </Link>
            <Link
              href="/contact"
              className="text-sm text-foreground/85 hover:text-accent transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
