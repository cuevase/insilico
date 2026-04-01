import { notFound } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { experiments } from "@/lib/experiments"
import { discussions, getDiscussion } from "@/lib/discussions"
import { SITE_NAME } from "@/lib/site"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return experiments
    .filter((e) => discussions[e.slug])
    .map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const discussion = getDiscussion(slug)
  if (!discussion) return { title: `Not Found — ${SITE_NAME}` }
  return {
    title: `${discussion.title} — ${SITE_NAME}`,
    description: `Neuroscience literature analysis of brain regions activated in the ${slug} experiment.`,
  }
}

const supportColors: Record<string, { text: string; bg: string }> = {
  Strong: { text: "text-emerald-700", bg: "bg-emerald-50" },
  Moderate: { text: "text-amber-700", bg: "bg-amber-50" },
  Weak: { text: "text-[#9C9488]", bg: "bg-[#EDE8DE]" },
}

export default async function DiscussionPage({ params }: PageProps) {
  const { slug } = await params
  const discussion = getDiscussion(slug)
  if (!discussion) notFound()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href={`/experiments/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-[#9C9488] hover:text-[#6B6459] transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to experiment
        </Link>

        <div className="mb-12">
          <h1 className="font-serif text-3xl font-medium text-foreground mb-2 md:text-4xl">
            {discussion.title}
          </h1>
          <p className="text-sm text-[#9C9488] mb-4">{discussion.subtitle}</p>
          <p className="text-sm text-[#6B6459] leading-relaxed max-w-2xl">
            {discussion.intro}
          </p>
        </div>

        <div className="space-y-14">
          {discussion.sections.map((section, si) => (
            <section key={si}>
              <h2 className="text-xs uppercase tracking-widest text-[#9C9488] mb-2">
                {section.label}
              </h2>
              <p className="text-sm text-[#6B6459] mb-6">{section.description}</p>

              <div className="space-y-6">
                {section.regions.map((region, ri) => {
                  const support = supportColors[region.literatureSupport]
                  return (
                    <div key={ri} className="rounded-md border border-border p-5">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="font-serif text-base font-medium text-foreground">
                          {region.hemisphere} {region.name}
                        </h3>
                        <span className="text-xs tabular-nums text-[#C4704B] font-semibold">
                          {region.weightShare}
                        </span>
                        <span className={`text-[10px] uppercase tracking-wider font-medium rounded px-1.5 py-0.5 ${support.text} ${support.bg}`}>
                          {region.literatureSupport}
                        </span>
                      </div>

                      <p className="text-sm text-[#6B6459] leading-relaxed mb-3">
                        {region.analysis}
                      </p>

                      <div className="border-l-2 border-[#C4704B]/30 pl-3">
                        <p className="text-xs text-[#6B6459] italic leading-relaxed">
                          {region.verdict}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}

          {/* Overall verdict */}
          <section>
            <h2 className="text-xs uppercase tracking-widest text-[#9C9488] mb-4">
              Overall verdict
            </h2>
            <div className="rounded-md border border-border bg-[#EDE8DE]/20 p-6">
              <p className="text-sm text-[#6B6459] leading-relaxed">
                {discussion.overallVerdict}
              </p>
            </div>
          </section>

          {/* References */}
          <section>
            <h2 className="text-xs uppercase tracking-widest text-[#9C9488] mb-4">
              References
            </h2>
            <ol className="space-y-2">
              {discussion.references.map((ref, i) => (
                <li key={i} className="text-xs text-[#9C9488] leading-relaxed pl-4 relative">
                  <span className="absolute left-0 tabular-nums">{i + 1}.</span>
                  {ref}
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-border pt-8 flex items-center justify-between">
          <p className="text-xs text-[#9C9488]">
            Analysis based on Destrieux cortical atlas (fsaverage5).
          </p>
          <Link
            href={`/experiments/${slug}`}
            className="text-sm text-[#6B6459] hover:text-[#C4704B] transition-colors"
          >
            Back to experiment
          </Link>
        </div>
      </main>
    </div>
  )
}
