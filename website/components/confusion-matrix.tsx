"use client"

import type { ConfusionMatrixData } from "@/lib/experiments"

export default function ConfusionMatrix({ data }: { data: ConfusionMatrixData }) {
  const flat = data.matrix.flat()
  const maxVal = Math.max(...flat)

  function cellColor(value: number, isOnDiagonal: boolean): string {
    const intensity = maxVal > 0 ? value / maxVal : 0
    if (isOnDiagonal) {
      const alpha = 0.14 + intensity * 0.42
      return `rgba(255, 255, 255, ${alpha})`
    }
    const alpha = 0.04 + intensity * 0.16
    return `rgba(255, 255, 255, ${alpha})`
  }

  return (
    <div className="inline-block">
      <div className="flex items-end gap-0">
        <div className="flex flex-col items-end justify-center pr-3 pb-8">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 -rotate-90 origin-center translate-y-6">
            Actual
          </p>
        </div>
        <div>
          <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${data.labels.length}, 1fr)` }}>
            {data.matrix.map((row, i) =>
              row.map((value, j) => (
                <div
                  key={`${i}-${j}`}
                  className="flex items-center justify-center rounded-sm w-16 h-16 sm:w-20 sm:h-20 transition-colors"
                  style={{ backgroundColor: cellColor(value, i === j) }}
                >
                  <span
                    className="text-lg font-semibold tabular-nums"
                    style={{ color: i === j ? "#ffc8be" : "rgba(250, 250, 250, 0.82)" }}
                  >
                    {value}
                  </span>
                </div>
              ))
            )}
          </div>
          <div
            className="grid gap-px mt-2"
            style={{ gridTemplateColumns: `repeat(${data.labels.length}, 1fr)` }}
          >
            {data.labels.map((label) => (
              <div key={label} className="flex items-center justify-center w-16 sm:w-20">
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground text-center mt-1">
            Predicted
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-1 mt-3 pr-1">
        {data.labels.map((label, i) => (
          <span key={label} className="text-[10px] text-muted-foreground">
            {i > 0 && " · "}
            Row {i + 1} = {label}
          </span>
        ))}
      </div>
    </div>
  )
}
