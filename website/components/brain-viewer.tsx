interface BrainImages {
  left_lateral: string
  right_lateral: string
  left_medial: string
  right_medial: string
}

interface BrainViewerProps {
  images: BrainImages
}

const views = [
  { key: 'left_lateral' as const, label: 'Left lateral' },
  { key: 'right_lateral' as const, label: 'Right lateral' },
  { key: 'left_medial' as const, label: 'Left medial' },
  { key: 'right_medial' as const, label: 'Right medial' },
]

export default function BrainViewer({ images }: BrainViewerProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {views.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-border bg-[#EDE8DE]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[key]}
                alt={`Brain activation — ${label} view`}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-center text-xs text-[#9C9488]">{label}</p>
          </div>
        ))}
      </div>

      {/* Colorbar */}
      <div className="mt-6 flex flex-col items-center gap-1.5">
        <div className="h-2.5 w-64 rounded-full bg-gradient-to-r from-[#2B4A8A] via-[#F5F0E8] to-[#8B1A0A]" />
        <div className="flex w-64 justify-between text-xs text-[#9C9488]">
          <span>Low</span>
          <span className="text-center">Activation</span>
          <span>High</span>
        </div>
      </div>
    </div>
  )
}
