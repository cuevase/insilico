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
              the fMRI response of the human cortex to arbitrary text, audio, and video inputs
              by learning from over 1,000 hours of neuroimaging data across 720 subjects. This
              project uses the &ldquo;unseen subject&rdquo; mode, which returns group-average
              predictions rather than individual brain responses.
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

          <div>
            <h2 className="font-serif text-lg font-medium text-foreground mb-3">Who runs this?</h2>
            <p>
              This project is built and maintained by <a href="https://linkedin.com/in/emiliano-cuevas-rodriguez-74538727b" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4 hover:text-[#C4704B] transition-colors">Emiliano Cuevas</a>. The experiments, the website,
              and the underlying infrastructure are all run by him as a research prototype exploring
              what computational brain encoding models can tell us about language processing.
            </p>
          </div>

          <div className="border-t border-border pt-8 space-y-3 text-sm text-[#9C9488]">
            <p>
              <a
                href="https://ai.meta.com/research/publications/a-foundation-model-of-vision-audition-and-language-for-in-silico-neuroscience/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6B6459] underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Read the paper
              </a>
            </p>
            <p>
              <a
                href="https://github.com/cuevase/insilico"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6B6459] underline underline-offset-4 hover:text-foreground transition-colors"
              >
                GitHub repository
              </a>
            </p>
            <p>
              Built by <a href="https://linkedin.com/in/emiliano-cuevas-rodriguez-74538727b" target="_blank" rel="noopener noreferrer" className="text-[#6B6459] underline underline-offset-4 hover:text-foreground transition-colors">Emiliano Cuevas</a> with{' '}
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
