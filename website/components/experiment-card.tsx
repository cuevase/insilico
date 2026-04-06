import Link from "next/link"
import type { Experiment } from "@/lib/experiments"

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  completed: { label: "Completed", color: "text-emerald-300", dot: "bg-emerald-400" },
  running: { label: "Running", color: "text-amber-300", dot: "bg-amber-400 animate-pulse" },
  planned: { label: "Planned", color: "text-muted-foreground", dot: "bg-white/45" },
}

const typeLabels: Record<string, string> = {
  classification: "Classification",
  regression: "Regression",
  encoding: "Encoding",
}

export default function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const status = statusConfig[experiment.status]
  const hasResults = !!experiment.results
  const primaryMetric = experiment.results?.metrics?.[0]

  return (
    <Link
      href={`/experiments/${experiment.slug}`}
      className="group block rounded-md border border-border bg-card p-6 transition-colors hover:border-white/35"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${status.dot}`} />
          <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">{experiment.date}</span>
      </div>

      <h3 className="font-serif text-lg font-medium text-foreground mb-1.5 group-hover:text-accent transition-colors">
        {experiment.name}
      </h3>
      <p className="text-sm text-foreground/85 leading-relaxed mb-4 line-clamp-2">
        {experiment.question}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground border border-border rounded px-2 py-0.5">
            {typeLabels[experiment.type]}
          </span>
          {experiment.nStimuli && (
            <span className="text-xs text-muted-foreground">{experiment.nStimuli} stimuli</span>
          )}
        </div>
        {hasResults && primaryMetric && (
          <span className="text-sm font-semibold tabular-nums text-accent">
            {typeof primaryMetric.value === "number"
              ? primaryMetric.value.toFixed(2)
              : primaryMetric.value}
          </span>
        )}
      </div>
    </Link>
  )
}
