import Navbar from "@/components/navbar"
import ExperimentCard from "@/components/experiment-card"
import { experiments } from "@/lib/experiments"

export const metadata = {
  title: "Experiments — insilico",
  description: "In-silico neuroscience experiments using TRIBE v2 brain encoding predictions.",
}

export default function ExperimentsPage() {
  const running = experiments.filter((e) => e.status === "running" || e.status === "completed")
  const planned = experiments.filter((e) => e.status === "planned")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-14">
          <h1 className="font-serif text-4xl font-medium text-foreground mb-4 md:text-5xl">
            Experiments
          </h1>
          <p className="text-lg text-[#6B6459] leading-relaxed max-w-2xl">
            A collection of in-silico neuroscience experiments. Each experiment uses TRIBE v2 to predict brain
            responses and tests a specific hypothesis about how the brain processes language, physics, humor, and more.
          </p>
        </div>

        {running.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xs uppercase tracking-widest text-[#9C9488] mb-5">
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
            <h2 className="text-xs uppercase tracking-widest text-[#9C9488] mb-5">
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
          <p className="text-sm text-[#9C9488] leading-relaxed max-w-xl">
            All experiments are designed and run by <a href="https://linkedin.com/in/emiliano-cuevas-rodriguez-74538727b" target="_blank" rel="noopener noreferrer" className="text-[#6B6459] hover:text-[#C4704B] transition-colors underline underline-offset-4">Emiliano Cuevas</a>. They follow a shared template: load
            stimuli, generate brain predictions via TRIBE v2, then apply statistical or machine learning
            analyses. Results shown here exclude raw stimuli and heavy data — only summary metrics, figures,
            and interpretations are displayed.
          </p>
        </div>
      </main>
    </div>
  )
}
