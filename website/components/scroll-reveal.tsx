"use client"

import { useEffect, useRef, type ReactNode } from "react"

export default function ScrollReveal({ children }: { children: ReactNode }) {
  const section = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = section.current
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (element.getBoundingClientRect().top <= window.innerHeight * .9) return

    element.classList.add("reveal-pending")
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      element.classList.remove("reveal-pending")
      observer.disconnect()
    }, { rootMargin: "0px 0px -10% 0px" })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={section} className="experiment-reveal pb-24 md:pb-36" aria-label="Experiments">
      {children}
    </section>
  )
}
