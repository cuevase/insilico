import type { BrainRegionAnalysis } from "@/lib/experiments"

function RegionBar({ percentage, color }: { percentage: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(percentage * 5, 100)}%`, backgroundColor: color }}
      />
    </div>
  )
}

export default function BrainRegions({ data }: { data: BrainRegionAnalysis }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="rounded border border-border px-3 py-2">
          <span className="text-muted-foreground text-xs">Sparsity</span>
          <p className="font-semibold tabular-nums text-foreground">{data.sparsity}%</p>
        </div>
        <div className="rounded border border-border px-3 py-2">
          <span className="text-muted-foreground text-xs">Active vertices</span>
          <p className="font-semibold tabular-nums text-foreground">
            {data.nonZeroVertices} <span className="text-muted-foreground font-normal">/ {data.totalVertices.toLocaleString()}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Positive regions */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#E74C3C]" />
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
              {data.positiveLabel}
            </h3>
          </div>
          <div className="space-y-3">
            {data.positiveRegions.map((region, i) => (
              <div key={i} className="rounded border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {region.hemisphere} {region.name}
                  </span>
                  <span className="text-xs tabular-nums text-[#E74C3C] font-semibold">
                    {region.percentage.toFixed(1)}%
                  </span>
                </div>
                <RegionBar percentage={region.percentage} color="#E74C3C" />
                {region.role && <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{region.role}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Negative regions */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#3498DB]" />
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
              {data.negativeLabel}
            </h3>
          </div>
          <div className="space-y-3">
            {data.negativeRegions.map((region, i) => (
              <div key={i} className="rounded border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {region.hemisphere} {region.name}
                  </span>
                  <span className="text-xs tabular-nums text-[#3498DB] font-semibold">
                    {region.percentage.toFixed(1)}%
                  </span>
                </div>
                <RegionBar percentage={region.percentage} color="#3498DB" />
                {region.role && <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{region.role}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Regions identified via L1-regularized logistic regression weights mapped onto the Destrieux cortical atlas (fsaverage5).
        Percentages reflect each region&apos;s share of total cortical weight for its category (excluding medial wall vertices).
      </p>
    </div>
  )
}
