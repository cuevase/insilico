import Navbar from '@/components/navbar'
import Link from 'next/link'
import { SITE_NAME } from '@/lib/site'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-24">
        <h1 className="font-serif text-4xl font-medium text-foreground mb-4 text-balance">
          About {SITE_NAME}
        </h1>

        <div className="space-y-8 text-base text-foreground/85 leading-relaxed">
          <p className="text-lg leading-relaxed">
            This project is a collection of in-silico neuroscience experiments built by{" "}
            <a href="https://linkedin.com/in/emiliano-cuevas-rodriguez-74538727b" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4 hover:text-accent transition-colors">Emiliano Cuevas</a>.
            The idea is simple: instead of putting people in an MRI scanner, we use a computational
            model to predict what the brain would do — then run experiments on those predictions
            to see what we can learn.
          </p>

          <div>
            <h2 className="font-serif text-lg font-medium text-foreground mb-3">The model: TRIBE v2</h2>
            <p>
              The engine behind every experiment is{" "}
              <a
                href="https://arxiv.org/abs/2401.13765"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4 hover:text-accent transition-colors"
              >
                TRIBE v2
              </a>, a multimodal brain encoding model developed by Meta Research.
              It was trained on over 1,000 hours of neuroimaging data across 720 subjects and can
              predict the fMRI response of the human cortex to arbitrary text, audio, and video inputs.
              This project uses the &ldquo;unseen subject&rdquo; mode, which returns group-average
              predictions rather than individual brain responses.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg font-medium text-foreground mb-3">What does &ldquo;in silico&rdquo; mean?</h2>
            <p>
              In silico is Latin for &ldquo;in silicon&rdquo; — experiments performed on a computer,
              as opposed to in vitro (in glass) or in vivo (in living organisms). Here, it means
              predicting brain activity computationally rather than measuring it in a scanner.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg font-medium text-foreground mb-3">How the experiments work</h2>
            <p>
              Each experiment follows the same pattern: feed carefully chosen stimuli (text or video)
              into TRIBE v2 to generate predicted brain activation maps — 20,484 cortical vertices per
              sample. Then train a classifier on those maps to see whether the brain representations
              alone can distinguish between conditions (e.g., humor vs. neutral, metaphor vs. literal,
              real physics vs. reversed). If the classifier succeeds, it tells us something about how
              the brain encodes those distinctions — and which regions matter most.
            </p>
          </div>

          <div className="border-t border-border pt-8 space-y-3 text-sm text-muted-foreground">
            <p>
              <a
                href="https://arxiv.org/abs/2401.13765"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/85 underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Read the TRIBE v2 paper
              </a>
            </p>
            <p>
              Built by{' '}
              <a href="https://linkedin.com/in/emiliano-cuevas-rodriguez-74538727b" target="_blank" rel="noopener noreferrer" className="text-foreground/85 underline underline-offset-4 hover:text-foreground transition-colors">Emiliano Cuevas</a>
              {' '}— a research prototype, not for clinical use.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
