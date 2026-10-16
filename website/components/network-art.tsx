"use client"

import { useEffect, useState } from "react"

const formations = [
  // The initial positions match the still illustration.
  [[44, 205], [102, 75], [155, 248], [207, 125], [273, 39], [310, 209], [379, 93], [427, 248], [465, 143]],
  // Three loose groups form.
  [[85, 162], [111, 137], [128, 188], [230, 128], [260, 104], [280, 157], [377, 147], [410, 193], [430, 161]],
  // The groups move toward one another.
  [[167, 134], [192, 108], [190, 169], [226, 142], [251, 111], [272, 170], [298, 139], [324, 111], [333, 178]],
  // One close cluster.
  [[218, 152], [238, 126], [243, 174], [258, 147], [263, 106], [280, 177], [294, 132], [304, 155], [267, 199]],
  // The cluster opens into an uneven orbit before scattering again.
  [[134, 149], [175, 75], [208, 223], [243, 111], [260, 32], [301, 196], [349, 86], [409, 215], [375, 151]],
] as const

const radii = [5, 5, 4, 6, 5, 6, 4, 5, 5] as const

export default function NetworkArt() {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let timer: number | undefined

    function syncMotion() {
      if (timer !== undefined) window.clearInterval(timer)
      if (reducedMotion.matches) {
        setStage(0)
        return
      }
      timer = window.setInterval(() => setStage((current) => (current + 1) % formations.length), 2600)
    }

    syncMotion()
    reducedMotion.addEventListener("change", syncMotion)
    return () => {
      if (timer !== undefined) window.clearInterval(timer)
      reducedMotion.removeEventListener("change", syncMotion)
    }
  }, [])

  return (
    <svg className="network-art h-auto w-full overflow-visible" viewBox="0 0 510 300" role="img" aria-label="Orange dots gathering and spreading apart">
      {formations[stage].map(([x, y], index) => (
        <circle
          key={index}
          cx={x}
          cy={y}
          r={radii[index]}
          className="network-node"
          style={{ transitionDelay: `${index * 70}ms` }}
        />
      ))}
    </svg>
  )
}
