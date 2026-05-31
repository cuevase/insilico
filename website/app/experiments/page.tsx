import Navbar from "@/components/navbar"
import ExperimentCard from "@/components/experiment-card"
import { experiments, getPinnedExperiments, withoutPinned } from "@/lib/experiments"
import { SITE_NAME } from "@/lib/site"

export const metadata = {
  title: `Experiments — ${SITE_NAME}`,
  description:
    "Experiments on brain encoding, EEG, language and cognition, and evolutionary simulation.",
}

export default function ExperimentsPage() {
  const pinned = getPinnedExperiments()
  const running = withoutPinned(
    experiments.filter((e) => e.status === "running" || e.status === "completed")
  )
  const planned = withoutPinned(experiments.filter((e) => e.status === "planned"))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-14">
          <h1 className="font-serif text-4xl font-medium text-foreground mb-4 md:text-5xl">
            Experiments
          </h1>
          <p className="text-lg text-foreground/85 leading-relaxed max-w-2xl">
            Studies on language, cognition, perception, and the origins of intelligence. Methods
            span cortical encoding models, EEG, and evolutionary simulation — each card links to
            the full write-up for that experiment.
          </p>
        </div>

        {pinned.length > 0 && (
          <section className="mb-12">
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

        {running.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-5">
              Active & Completed
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {running.map((exp) => (
                <ExperimentCard key={exp.slug} experiment={exp} />
              ))}
            </div>
          </section>
        )}

        {planned.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-5">
              Planned
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {planned.map((exp) => (
                <ExperimentCard key={exp.slug} experiment={exp} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-16 border-t border-border pt-8 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
            All experiments are designed and run by{" "}
            <a
              href="https://linkedin.com/in/emiliano-cuevas-rodriguez-74538727b"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/85 hover:text-accent transition-colors underline underline-offset-4"
            >
              Emiliano Cuevas
            </a>
            . Encoding-model studies follow stimuli → predicted cortical maps → analysis; EEG and
            simulation projects follow their own pipelines. What you see here is summary metrics,
            figures, and interpretation — not raw data.
          </p>
        </div>
      </main>
    </div>
  )
}
