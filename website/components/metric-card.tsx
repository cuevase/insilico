import type { MetricValue } from "@/lib/experiments"

export default function MetricCard({ metric }: { metric: MetricValue }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-background p-4">
      <p className="text-xs text-[#9C9488] uppercase tracking-wider">{metric.label}</p>
      <p className="text-xl font-semibold tabular-nums text-foreground">
        {typeof metric.value === "number" ? metric.value.toFixed(metric.value < 1 ? 3 : 1) : metric.value}
        {metric.unit && <span className="text-sm font-normal text-[#9C9488] ml-1">{metric.unit}</span>}
      </p>
      {metric.description && (
        <p className="text-xs text-[#9C9488] leading-relaxed">{metric.description}</p>
      )}
    </div>
  )
}
