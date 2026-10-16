"use client"

import { useEffect, useRef } from "react"

const initialPositions = [
  [44, 205], [102, 75], [155, 248], [207, 125], [273, 39],
  [310, 209], [379, 93], [427, 248], [465, 143],
] as const

const radii = [5, 5, 4, 6, 5, 6, 4, 5, 5] as const

const patterns = [
  // Three small gatherings.
  [[85, 162], [111, 137], [128, 188], [230, 128], [260, 104], [280, 157], [377, 147], [410, 193], [430, 161]],
  // A loose orbit.
  [[147, 150], [172, 91], [198, 218], [241, 78], [257, 155], [308, 214], [346, 88], [399, 173], [349, 157]],
  // One brief, close cluster.
  [[218, 152], [238, 126], [243, 174], [258, 147], [263, 106], [280, 177], [294, 132], [304, 155], [267, 199]],
] as const

const random = (min: number, max: number) => min + Math.random() * (max - min)
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export default function NetworkArt() {
  const dots = useRef<(SVGCircleElement | null)[]>([])

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const timers = new Set<number>()
    const targets: [number, number][] = initialPositions.map(([x, y]) => [x, y])
    let previousPattern = -1

    function schedule(callback: () => void, delay: number) {
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        callback()
      }, delay)
      timers.add(timer)
    }

    function stopTimers() {
      timers.forEach((timer) => window.clearTimeout(timer))
      timers.clear()
    }

    function moveDot(index: number, x: number, y: number, duration: number, delay = 0) {
      const dot = dots.current[index]
      if (!dot) return
      dot.style.transition = `cx ${duration}ms cubic-bezier(.45, 0, .2, 1) ${delay}ms, cy ${duration}ms cubic-bezier(.45, 0, .2, 1) ${delay}ms`
      dot.setAttribute("cx", x.toFixed(1))
      dot.setAttribute("cy", y.toFixed(1))
      targets[index] = [x, y]
    }

    function wander(index: number) {
      let x = 0
      let y = 0
      for (let attempt = 0; attempt < 20; attempt++) {
        x = random(40, 470)
        y = random(35, 265)
        const travel = Math.hypot(x - targets[index][0], y - targets[index][1])
        const nearAnotherDot = targets.some(([otherX, otherY], otherIndex) =>
          otherIndex !== index && Math.hypot(x - otherX, y - otherY) < 30,
        )
        if (travel > 45 && !nearAnotherDot) break
      }

      const duration = random(2100, 4300)
      moveDot(index, x, y, duration)
      schedule(() => wander(index), duration + random(250, 1200))
    }

    function wanderIndependently() {
      initialPositions.forEach((_, index) => schedule(() => wander(index), random(100, 1500)))
    }

    function gatherBriefly() {
      stopTimers()
      let patternIndex = Math.floor(random(0, patterns.length))
      if (patternIndex === previousPattern) patternIndex = (patternIndex + 1) % patterns.length
      previousPattern = patternIndex

      const angle = random(-.17, .17)
      const offsetX = random(-18, 18)
      const offsetY = random(-12, 12)
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)

      patterns[patternIndex].forEach(([x, y], index) => {
        const dx = x - 255
        const dy = y - 150
        moveDot(
          index,
          clamp(255 + dx * cos - dy * sin + offsetX + random(-5, 5), 35, 475),
          clamp(150 + dx * sin + dy * cos + offsetY + random(-5, 5), 30, 270),
          random(1600, 2400),
          random(0, 420),
        )
      })

      schedule(() => {
        wanderIndependently()
        schedule(gatherBriefly, random(16000, 25000))
      }, 3700)
    }

    function syncMotion() {
      stopTimers()
      if (reducedMotion.matches) {
        initialPositions.forEach(([x, y], index) => {
          const dot = dots.current[index]
          if (!dot) return
          dot.style.transition = "none"
          dot.setAttribute("cx", String(x))
          dot.setAttribute("cy", String(y))
          targets[index] = [x, y]
        })
        return
      }
      if (document.hidden) return
      wanderIndependently()
      schedule(gatherBriefly, random(9000, 13000))
    }

    syncMotion()
    reducedMotion.addEventListener("change", syncMotion)
    document.addEventListener("visibilitychange", syncMotion)
    return () => {
      stopTimers()
      reducedMotion.removeEventListener("change", syncMotion)
      document.removeEventListener("visibilitychange", syncMotion)
    }
  }, [])

  return (
    <svg className="network-art h-auto w-full overflow-visible" viewBox="0 0 510 300" role="img" aria-label="Orange dots drifting independently and occasionally forming clusters">
      {initialPositions.map(([x, y], index) => (
        <circle
          key={index}
          ref={(dot) => { dots.current[index] = dot }}
          cx={x}
          cy={y}
          r={radii[index]}
          className="network-node"
        />
      ))}
    </svg>
  )
}
