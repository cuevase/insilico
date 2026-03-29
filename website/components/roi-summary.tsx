interface ROIValue {
  name: string
  label: string
  value: number
}

interface ROICardProps {
  roi: ROIValue
}

function ROICard({ roi }: ROICardProps) {
  const pct = Math.round(roi.value * 100)
  const isHigh = roi.value >= 0.6

  return (
    <div className="flex min-w-[160px] flex-col gap-2 rounded-md border border-border bg-background p-4">
      <div>
        <p className="font-serif text-sm font-medium text-foreground leading-snug">{roi.name}</p>
        <p className="mt-0.5 text-xs text-[#9C9488] leading-snug">{roi.label}</p>
      </div>
      <p
        className="text-xl font-semibold tabular-nums"
        style={{ color: isHigh ? '#C4704B' : '#6B6459' }}
      >
        {roi.value.toFixed(2)}
      </p>
      <div className="h-1 w-full overflow-hidden rounded-full bg-[#EDE8DE]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            backgroundColor: isHigh ? '#C4704B' : '#9C9488',
          }}
        />
      </div>
    </div>
  )
}

interface ROISummaryProps {
  roiValues: ROIValue[]
}

export default function ROISummary({ roiValues }: ROISummaryProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 md:grid-cols-6">
      {roiValues.map((roi) => (
        <ROICard key={roi.name} roi={roi} />
      ))}
    </div>
  )
}
