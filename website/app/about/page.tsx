import Navbar from '@/components/navbar'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-24">
        <h1 className="font-serif text-4xl font-medium text-foreground mb-10 text-balance">
          About insilico
        </h1>

        <div className="space-y-8 text-base text-[#6B6459] leading-relaxed">
          <div>
            <h2 className="font-serif text-lg font-medium text-foreground mb-3">What is TRIBE v2?</h2>
            <p>
              TRIBE v2 is a multimodal brain encoding model developed by Meta Research. It predicts
              the fMRI response of the human visual and language cortex to arbitrary text or image
              inputs by learning from large-scale neuroimaging data. This interface uses the
              &ldquo;unseen subject&rdquo; mode, which returns group-average predictions rather than
              individual brain responses.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg font-medium text-foreground mb-3">What does &ldquo;in silico&rdquo; mean?</h2>
            <p>
              In silico is Latin for &ldquo;in silicon&rdquo; — referring to experiments or simulations
              performed on a computer, as opposed to in vitro (in glass) or in vivo (in living
              organisms). Here, it describes predicting brain activity through computation rather
              than measurement.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg font-medium text-foreground mb-3">How it works</h2>
            <p>
              You type a sentence or passage. The model encodes it through a language backbone,
              then maps those representations onto cortical vertices via a learned linear projection
              trained on paired fMRI and stimulus data. The result is a whole-brain activation map
              at 20,484 vertices per hemisphere.
            </p>
          </div>

          <div className="border-t border-border pt-8 space-y-3 text-sm text-[#9C9488]">
            <p>
              <a
                href="https://arxiv.org/abs/2401.13765"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6B6459] underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Read the paper
              </a>
            </p>
            <p>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6B6459] underline underline-offset-4 hover:text-foreground transition-colors"
              >
                GitHub repository
              </a>
            </p>
            <p>
              Built with{' '}
              <Link href="/" className="text-[#6B6459] underline underline-offset-4 hover:text-foreground transition-colors">
                insilico
              </Link>{' '}
              — a research prototype. Not for clinical use.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
