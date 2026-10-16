import BackHome from '@/components/back-home'
import Link from 'next/link'
import { SITE_NAME, TRIBE_V2_PUBLICATION_URL } from '@/lib/site'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="site-wrap max-w-3xl py-16 md:py-24">
        <div className="mb-10"><BackHome /></div>
        <p className="section-label mb-4">The idea behind the work</p>
        <h1 className="text-5xl font-medium tracking-[-.05em] text-foreground mb-8 text-balance md:text-6xl">
          About {SITE_NAME}
        </h1>

        <div className="space-y-8 text-base text-foreground/85 leading-relaxed">
          <p className="text-lg leading-relaxed">
            {SITE_NAME} is a research lab built by{' '}
            <a
              href="https://linkedin.com/in/emiliano-cuevas-rodriguez-74538727b"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-accent transition-colors"
            >
              Emiliano Cuevas
            </a>
            . It is a place for experiments in intelligence and behavior at different scales:
            predicted cortical responses, measured EEG, evolutionary simulations, and societies
            of artificial agents. Every study poses a clear question, uses appropriate data or
            models, and interprets results carefully.
          </p>

          <div>
            <h2 className="font-serif text-lg font-medium text-foreground mb-3">
              Computational & in-silico studies
            </h2>
            <p>
              Several experiments use{' '}
              <a
                href={TRIBE_V2_PUBLICATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4 hover:text-accent transition-colors"
              >
                TRIBE v2
              </a>
              , a multimodal brain encoding model from Meta Research. It was trained on over
              1,000 hours of neuroimaging data across 720 subjects and can predict the fMRI
              response of the human cortex to text, audio, and video inputs. Those projects use
              the &ldquo;unseen subject&rdquo; mode, which returns group-average predictions rather
              than individual brain responses — useful for asking what a model says about
              condition differences without collecting new fMRI.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg font-medium text-foreground mb-3">
              Empirical recordings
            </h2>
            <p>
              Other experiments use data measured directly from participants — such as EEG —
              with standard acquisition, preprocessing, and analysis pipelines. Those write-ups
              focus on design, signal processing, and inference for that modality.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-lg font-medium text-foreground mb-3">
              Agent societies
            </h2>
            <p>
              <Link
                href="/nodo"
                className="text-foreground underline underline-offset-4 hover:text-accent transition-colors"
              >
                Nodo
              </Link>{' '}
              studies how language-model agents reason about one another and form alliances in
              shared environments. Its voting experiment follows two groups of 20 agents through
              public ballots, private deals, eliminations, and a final trust dilemma. This work
              extends the lab&apos;s question from individual systems to collective behavior.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg font-medium text-foreground mb-3">
              What does &ldquo;in silico&rdquo; mean?
            </h2>
            <p>
              In silico is Latin for &ldquo;in silicon&rdquo; — experiments performed on a
              computer, as opposed to in vitro (in glass) or in vivo (in living organisms). Here,
              it usually means predicting or simulating brain activity computationally rather than
              measuring it in a scanner, though the lab also includes in vivo recording work.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg font-medium text-foreground mb-3">
              How the experiments are organized
            </h2>
            <p>
              Encoding-model studies often follow a fixed pattern: feed stimuli into an encoding
              model to obtain predicted cortical maps (for TRIBE v2, 20,484 vertices per sample),
              then train a classifier or run statistics to test whether representations differ
              across conditions. EEG studies follow acquisition and preprocessing suited to the
              hypothesis. Simulation work evolves populations under explicit world dynamics and
              logs distributional metrics over time. Each experiment page documents its own methods
              and limitations.
            </p>
          </div>

          <div className="border-t border-border pt-8 space-y-3 text-sm text-muted-foreground">
            <p>
              <a
                href={TRIBE_V2_PUBLICATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/85 underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Read the TRIBE v2 paper
              </a>
            </p>
            <p>
              Built by{' '}
              <a
                href="https://linkedin.com/in/emiliano-cuevas-rodriguez-74538727b"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/85 underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Emiliano Cuevas
              </a>{' '}
              — a research prototype, not for clinical use.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
