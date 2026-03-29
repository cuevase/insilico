"use client"

import { useMemo } from "react"
import type { ChartPoint } from "@/lib/experiments"

interface ScatterPlotProps {
  data: ChartPoint[]
  xLabel?: string
  yLabel?: string
  colorByGroup?: boolean
  height?: number
}

const GROUP_COLORS: Record<string, string> = {
  humor: "#E74C3C",
  neutral: "#3498DB",
}

const DEFAULT_COLOR = "#C4704B"

export default function ScatterPlot({
  data,
  xLabel = "Component 1",
  yLabel = "Component 2",
  colorByGroup = true,
  height = 300,
}: ScatterPlotProps) {
  const { points, xRange, yRange, groups } = useMemo(() => {
    const xs = data.map((d) => d.x)
    const ys = data.map((d) => d.y)
    const pad = 0.1
    const xMin = Math.min(...xs)
    const xMax = Math.max(...xs)
    const yMin = Math.min(...ys)
    const yMax = Math.max(...ys)
    const xPad = (xMax - xMin) * pad
    const yPad = (yMax - yMin) * pad

    const xRange = { min: xMin - xPad, max: xMax + xPad }
    const yRange = { min: yMin - yPad, max: yMax + yPad }

    const uniqueGroups = [...new Set(data.map((d) => d.group).filter(Boolean))] as string[]

    const points = data.map((d) => ({
      cx: ((d.x - xRange.min) / (xRange.max - xRange.min)) * 100,
      cy: 100 - ((d.y - yRange.min) / (yRange.max - yRange.min)) * 100,
      color: colorByGroup && d.group ? GROUP_COLORS[d.group] ?? DEFAULT_COLOR : DEFAULT_COLOR,
      label: d.label,
      group: d.group,
    }))

    return { points, xRange, yRange, groups: uniqueGroups }
  }, [data, colorByGroup])

  return (
    <div>
      <div className="relative border border-border rounded-md bg-background overflow-hidden" style={{ height }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          {[0, 25, 50, 75, 100].map((v) => (
            <line key={`h-${v}`} x1="0" x2="100" y1={v} y2={v} stroke="#EDE8DE" strokeWidth="0.3" />
          ))}
          {[0, 25, 50, 75, 100].map((v) => (
            <line key={`v-${v}`} x1={v} x2={v} y1="0" y2="100" stroke="#EDE8DE" strokeWidth="0.3" />
          ))}
        </svg>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.cx}
              cy={p.cy}
              r="0.8"
              fill={p.color}
              fillOpacity={0.7}
              stroke={p.color}
              strokeWidth="0.2"
              strokeOpacity={0.9}
            />
          ))}
        </svg>

        <div className="absolute bottom-1.5 left-0 right-0 flex justify-between px-3 text-[10px] text-[#9C9488] tabular-nums">
          <span>{xRange.min.toFixed(1)}</span>
          <span>{((xRange.min + xRange.max) / 2).toFixed(1)}</span>
          <span>{xRange.max.toFixed(1)}</span>
        </div>
        <div className="absolute top-0 bottom-0 left-1.5 flex flex-col justify-between py-3 text-[10px] text-[#9C9488] tabular-nums">
          <span>{yRange.max.toFixed(1)}</span>
          <span>{yRange.min.toFixed(1)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-[#9C9488]">{xLabel}</p>
        {groups.length > 0 && (
          <div className="flex items-center gap-3">
            {groups.map((g) => (
              <div key={g} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: GROUP_COLORS[g] ?? DEFAULT_COLOR }}
                />
                <span className="text-xs text-[#9C9488] capitalize">{g}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-[#9C9488] -rotate-0 mt-0">{yLabel}</p>
    </div>
  )
}
