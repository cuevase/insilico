import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/navbar"
import MetricCard from "@/components/metric-card"
import ConfusionMatrix from "@/components/confusion-matrix"
import ClassificationTable from "@/components/classification-table"
import ScatterPlot from "@/components/scatter-plot"
import BrainRegions from "@/components/brain-regions"
import { experiments, getExperiment } from "@/lib/experiments"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return experiments.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const experiment = getExperiment(slug)
  if (!experiment) return { title: "Not Found — insilico" }
  return {
    title: `${experiment.name} — insilico`,
    description: experiment.description,
  }
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-50" },
  running: { label: "Running", color: "text-amber-700", bg: "bg-amber-50" },
  planned: { label: "Planned", color: "text-[#9C9488]", bg: "bg-[#EDE8DE]" },
}

const typeLabels: Record<string, string> = {
  classification: "Classification",
  regression: "Regression",
  encoding: "Encoding",
}

export default async function ExperimentPage({ params }: PageProps) {
  const { slug } = await params
  const experiment = getExperiment(slug)
  if (!experiment) notFound()

  const status = statusConfig[experiment.status]
  const results = experiment.results

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/experiments"
          className="inline-flex items-center gap-1.5 text-sm text-[#9C9488] hover:text-[#6B6459] transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All experiments
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${status.color} ${status.bg}`}>
              {status.label}
            </span>
            <span className="text-xs text-[#9C9488] border border-border rounded px-2 py-0.5">
              {typeLabels[experiment.type]}
            </span>
            <span className="text-xs text-[#9C9488] tabular-nums">{experiment.date}</span>
          </div>
          <h1 className="font-serif text-3xl font-medium text-foreground mb-3 md:text-4xl">
            {experiment.name}
          </h1>
          <p className="text-base text-[#6B6459] leading-relaxed max-w-2xl">
            {experiment.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {experiment.tags.map((tag) => (
              <span key={tag} className="text-xs text-[#9C9488] border border-border/60 rounded-full px-2.5 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* No results yet */}
        {!results && (
          <div className="border border-border rounded-md p-12 text-center">
            <p className="font-serif text-lg text-[#6B6459] mb-2">No results yet</p>
            <p className="text-sm text-[#9C9488]">
              This experiment is {experiment.status === "planned" ? "planned" : "currently running"}.
              Results will appear here once available.
            </p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-12">
            {/* Summary */}
            <section>
              <h2 className="text-xs uppercase tracking-widest text-[#9C9488] mb-4">Summary</h2>
              <p className="text-sm text-[#6B6459] leading-relaxed max-w-2xl">{results.summary}</p>
            </section>

            {/* Key metrics */}
            <section>
              <h2 className="text-xs uppercase tracking-widest text-[#9C9488] mb-4">Key metrics</h2>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                {results.metrics.map((m) => (
                  <MetricCard key={m.label} metric={m} />
                ))}
              </div>
            </section>

            {/* Confusion matrix */}
            {results.confusionMatrix && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-[#9C9488] mb-4">
                  Confusion matrix
                </h2>
                <ConfusionMatrix data={results.confusionMatrix} />
              </section>
            )}

            {/* Classification report */}
            {results.classificationReport && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-[#9C9488] mb-4">
                  Classification report
                </h2>
                <div className="max-w-lg">
                  <ClassificationTable rows={results.classificationReport} />
                </div>
              </section>
            )}

            {/* Scatter plot */}
            {results.scatterData && results.scatterData.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-[#9C9488] mb-4">
                  {experiment.type === "regression"
                    ? "Predicted vs actual"
                    : "PCA projection"}
                </h2>
                <div className="max-w-xl">
                  <ScatterPlot
                    data={results.scatterData}
                    xLabel={experiment.type === "regression" ? "Actual complexity score" : experiment.slug === "humor" ? "PC1 (39.7% var)" : experiment.slug === "physics" ? "PC1 (63.1% var)" : experiment.slug === "metaphor" ? "PC1 (28.1% var)" : "PC1"}
                    yLabel={experiment.type === "regression" ? "Predicted complexity score" : experiment.slug === "humor" ? "PC2 (23.9% var)" : experiment.slug === "physics" ? "PC2 (17.6% var)" : experiment.slug === "metaphor" ? "PC2 (21.0% var)" : "PC2"}
                    colorByGroup={experiment.type === "classification"}
                  />
                </div>
              </section>
            )}

            {/* Discriminative brain regions */}
            {results.brainRegions && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-[#9C9488] mb-4">
                  Discriminative brain regions
                </h2>
                <BrainRegions data={results.brainRegions} />
              </section>
            )}

            {/* Figures */}
            {results.figures && results.figures.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-[#9C9488] mb-6">
                  Figures
                </h2>
                <div className="space-y-8">
                  {results.figures.map((fig, i) => (
                    <div key={i} className="rounded-md border border-border overflow-hidden">
                      {fig.imagePath ? (
                        <div className="bg-white p-4 flex items-center justify-center">
                          <Image
                            src={fig.imagePath}
                            alt={fig.label}
                            width={800}
                            height={600}
                            className="max-w-full h-auto"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="bg-[#EDE8DE]/30 h-48 flex items-center justify-center">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9C9488" strokeWidth="1.5" className="opacity-40">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                        </div>
                      )}
                      <div className="px-4 py-3 border-t border-border">
                        <p className="font-serif text-sm font-medium text-foreground">{fig.label}</p>
                        <p className="text-xs text-[#9C9488] leading-relaxed mt-0.5">{fig.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}

        {/* Footer */}
        <div className="mt-16 border-t border-border pt-8 flex items-center justify-between">
          <p className="text-xs text-[#9C9488]">
            Experiment data excludes raw stimuli and large prediction arrays.
          </p>
          <Link
            href="/experiments"
            className="text-sm text-[#6B6459] hover:text-[#C4704B] transition-colors"
          >
            Back to experiments
          </Link>
        </div>
      </main>
    </div>
  )
}
