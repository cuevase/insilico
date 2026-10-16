import Link from "next/link"
import type { Experiment } from "@/lib/experiments"

export default function ExperimentCard({ experiment }: { experiment: Experiment; pinned?: boolean }) {
  return (
    <Link
      href={`/experiments/${experiment.slug}`}
      className="group flex min-h-20 items-center justify-between gap-6 py-5 transition-colors hover:text-accent"
    >
      <div className="flex min-w-0 items-center gap-5">
        <span className={`h-2 w-2 shrink-0 rounded-full ${experiment.status === "planned" ? "border border-[#aaa]" : "bg-accent"}`} aria-hidden="true" />
        <span className="text-base font-medium tracking-tight sm:text-lg">{experiment.name}</span>
      </div>
    </Link>
  )
}
