import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/navbar"
import MetricCard from "@/components/metric-card"
import ConfusionMatrix from "@/components/confusion-matrix"
import ClassificationTable from "@/components/classification-table"
import ScatterPlot from "@/components/scatter-plot"
import BrainRegions from "@/components/brain-regions"
import { experiments, getExperiment, type ExperimentVideo } from "@/lib/experiments"
import { discussions } from "@/lib/discussions"
import { SITE_NAME } from "@/lib/site"
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
  if (!experiment) return { title: `Not Found — ${SITE_NAME}` }
  return {
    title: `${experiment.name} — ${SITE_NAME}`,
    description: experiment.description,
  }
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: "Completed", color: "text-emerald-300", bg: "bg-emerald-950/40" },
  running: { label: "Running", color: "text-amber-300", bg: "bg-amber-950/40" },
  planned: { label: "Planned", color: "text-muted-foreground", bg: "bg-white/10" },
}

const typeLabels: Record<string, string> = {
  classification: "Classification",
  regression: "Regression",
  encoding: "Encoding",
  simulation: "Simulation",
}

function youtubeEmbedId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m?.[1] ?? null
}

function ExperimentVideoBlock({ video }: { video: ExperimentVideo }) {
  const ytId = youtubeEmbedId(video.src)
  return (
    <figure className="space-y-3">
      <div className="rounded-md border border-border overflow-hidden bg-black aspect-video max-h-[70vh]">
        {ytId ? (
          <iframe
            title={video.caption ?? "Experiment video"}
            src={`https://www.youtube-nocookie.com/embed/${ytId}`}
            className="w-full h-full min-h-[220px]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-contain max-h-[70vh]"
            src={video.src}
          >
            Your browser does not support embedded video.
          </video>
        )}
      </div>
      {video.caption && (
        <figcaption className="text-xs text-muted-foreground leading-relaxed">{video.caption}</figcaption>
      )}
    </figure>
  )
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
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
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
            <span className="text-xs text-muted-foreground border border-border rounded px-2 py-0.5">
              {typeLabels[experiment.type]}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">{experiment.date}</span>
          </div>
          <h1 className="font-serif text-3xl font-medium text-foreground mb-3 md:text-4xl">
            {experiment.name}
          </h1>
          <p className="text-base text-foreground/85 leading-relaxed max-w-2xl">
            {experiment.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {experiment.tags.map((tag) => (
              <span key={tag} className="text-xs text-muted-foreground border border-border/60 rounded-full px-2.5 py-0.5">
                {tag}
              </span>
            ))}
          </div>

          {(experiment.repositoryUrl || experiment.video) && (
            <div className="mt-10 space-y-8 max-w-3xl">
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Code &amp; media</h2>
              {experiment.repositoryUrl && (
                <p className="text-sm text-foreground/85">
                  <a
                    href={experiment.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-foreground font-medium underline underline-offset-4 hover:text-accent transition-colors"
                  >
                    {experiment.repositoryUrl.includes("github.com") ? "View on GitHub" : "Open repository"}
                    <span aria-hidden className="text-muted-foreground">
                      ↗
                    </span>
                  </a>
                </p>
              )}
              {experiment.video && <ExperimentVideoBlock video={experiment.video} />}
            </div>
          )}
        </div>

        {/* No results yet */}
        {!results && (
          <div className="border border-border rounded-md bg-card/50 p-12 text-center">
            <p className="font-serif text-lg text-foreground/85 mb-2">No results yet</p>
            <p className="text-sm text-muted-foreground">
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
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Summary</h2>
              <p className="text-sm text-foreground/85 leading-relaxed max-w-2xl">{results.summary}</p>
            </section>

            {/* Key metrics */}
            <section>
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Key metrics</h2>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                {results.metrics.map((m) => (
                  <MetricCard key={m.label} metric={m} />
                ))}
              </div>
            </section>

            {/* Confusion matrix */}
            {results.confusionMatrix && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                  Confusion matrix
                </h2>
                <ConfusionMatrix data={results.confusionMatrix} />
              </section>
            )}

            {/* Classification report */}
            {results.classificationReport && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
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
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
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
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                  Discriminative brain regions
                </h2>
                <BrainRegions data={results.brainRegions} />
                {discussions[slug] && (
                  <p className="text-sm text-foreground/85 mt-6 leading-relaxed">
                    Interested in what these regions mean?{" "}
                    <Link
                      href={`/experiments/${slug}/discussion`}
                      className="text-foreground underline underline-offset-4 decoration-accent/40 hover:decoration-accent hover:text-accent transition-colors"
                    >
                      Read the full discussion
                    </Link>{" "}
                    — a region-by-region analysis comparing these findings to published neuroscience literature.
                  </p>
                )}
              </section>
            )}

            {/* Figures */}
            {results.figures && results.figures.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-6">
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
                        <div className="bg-card/60 h-48 flex items-center justify-center">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40 text-muted-foreground">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                        </div>
                      )}
                      <div className="px-4 py-3 border-t border-border">
                        <p className="font-serif text-sm font-medium text-foreground">{fig.label}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{fig.description}</p>
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
          <p className="text-xs text-muted-foreground">
            Experiment data excludes raw stimuli and large prediction arrays.
          </p>
          <Link
            href="/experiments"
            className="text-sm text-foreground/85 hover:text-accent transition-colors"
          >
            Back to experiments
          </Link>
        </div>
      </main>
    </div>
  )
}
