import type { ClassificationReportRow } from "@/lib/experiments"

export default function ClassificationTable({ rows }: { rows: ClassificationReportRow[] }) {
  const avgPrecision = rows.reduce((s, r) => s + r.precision, 0) / rows.length
  const avgRecall = rows.reduce((s, r) => s + r.recall, 0) / rows.length
  const avgF1 = rows.reduce((s, r) => s + r.f1, 0) / rows.length
  const totalSupport = rows.reduce((s, r) => s + r.support, 0)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Class
            </th>
            <th className="text-right py-2 px-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Precision
            </th>
            <th className="text-right py-2 px-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Recall
            </th>
            <th className="text-right py-2 px-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
              F1
            </th>
            <th className="text-right py-2 pl-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Support
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border/50">
              <td className="py-2.5 pr-4 font-serif font-medium text-foreground">{row.label}</td>
              <td className="py-2.5 px-4 text-right tabular-nums text-foreground/85">{row.precision.toFixed(2)}</td>
              <td className="py-2.5 px-4 text-right tabular-nums text-foreground/85">{row.recall.toFixed(2)}</td>
              <td className="py-2.5 px-4 text-right tabular-nums text-foreground/85">{row.f1.toFixed(2)}</td>
              <td className="py-2.5 pl-4 text-right tabular-nums text-muted-foreground">{row.support}</td>
            </tr>
          ))}
          <tr className="border-t border-border">
            <td className="py-2.5 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Macro avg
            </td>
            <td className="py-2.5 px-4 text-right tabular-nums font-medium text-foreground">
              {avgPrecision.toFixed(2)}
            </td>
            <td className="py-2.5 px-4 text-right tabular-nums font-medium text-foreground">
              {avgRecall.toFixed(2)}
            </td>
            <td className="py-2.5 px-4 text-right tabular-nums font-medium text-foreground">
              {avgF1.toFixed(2)}
            </td>
            <td className="py-2.5 pl-4 text-right tabular-nums text-muted-foreground">{totalSupport}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
