import Link from "next/link"
import Navbar from "@/components/navbar"
import { SITE_NAME } from "@/lib/site"
import ExperimentCard from "@/components/experiment-card"
import { experiments } from "@/lib/experiments"

const completed = experiments.filter((e) => e.status === "completed")
const planned = experiments.filter((e) => e.status === "planned" || e.status === "running")

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
          <p className="text-lg text-[#6B6459] leading-relaxed max-w-2xl mb-4">
            A collection of in-silico neuroscience experiments exploring what computational
            brain encoding models can tell us about how the brain processes language, humor,
            physics, and more.
          </p>
          <p className="text-base text-[#6B6459] leading-relaxed max-w-2xl">
            Built by{" "}
            <a
              href="https://linkedin.com/in/emiliano-cuevas-rodriguez-74538727b"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-medium underline underline-offset-4 hover:text-[#C4704B] transition-colors"
            >
              Emiliano Cuevas
            </a>{" "}
            using{" "}
            <a
              href="https://ai.meta.com/research/publications/a-foundation-model-of-vision-audition-and-language-for-in-silico-neuroscience/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-[#C4704B] transition-colors"
            >
              TRIBE v2
            </a>
            , a multimodal brain encoding model from Meta Research.
          </p>
        </div>

        {/* What is this */}
        <section className="pb-14">
          <h2 className="text-xs uppercase tracking-widest text-[#9C9488] mb-5">
            How it works
          </h2>
          <div className="space-y-4 text-sm text-[#6B6459] leading-relaxed max-w-2xl">
            <p>
              TRIBE v2 predicts the fMRI response of the human cortex to arbitrary stimuli —
              text, audio, and video — by mapping neural network representations onto 20,484
              cortical vertices. It was trained on large-scale neuroimaging data and can
              generate whole-brain activation patterns for any input without needing a real
              brain scan.
            </p>
            <p>
              Each experiment takes a set of stimuli (sentences, videos, etc.), passes them
              through the model to generate predicted brain responses, then applies machine
              learning classifiers or statistical analyses to test a specific neuroscience
              hypothesis — all in silico.
            </p>
          </div>
        </section>

        {/* Completed experiments */}
        {completed.length > 0 && (
          <section className="pb-12">
            <h2 className="text-xs uppercase tracking-widest text-[#9C9488] mb-5">
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
            <h2 className="text-xs uppercase tracking-widest text-[#9C9488] mb-5">
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
          <p className="text-xs text-[#9C9488] leading-relaxed max-w-sm">
            All experiments are designed and run by <a href="https://linkedin.com/in/emiliano-cuevas-rodriguez-74538727b" target="_blank" rel="noopener noreferrer" className="text-[#6B6459] hover:text-[#C4704B] transition-colors underline underline-offset-4">Emiliano Cuevas</a>.
            Not for clinical use.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/experiments"
              className="text-sm text-[#6B6459] hover:text-[#C4704B] transition-colors"
            >
              All experiments
            </Link>
            <a
              href="https://github.com/cuevase/insilico"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#6B6459] hover:text-[#C4704B] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
