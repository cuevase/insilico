import Navbar from '@/components/navbar'
import { SITE_NAME, TRIBE_V2_PUBLICATION_URL } from '@/lib/site'

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
            {SITE_NAME} is a home for neuroscience experiments built by{' '}
            <a
              href="https://linkedin.com/in/emiliano-cuevas-rodriguez-74538727b"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-accent transition-colors"
            >
              Emiliano Cuevas
            </a>
            . Work here spans computational approaches (predicting or encoding brain responses)
            and empirical methods (for example EEG and other recordings). The goal is the same in
            every study: pose a clear question, use appropriate data, and interpret results
            carefully.
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
              In-silico studies often follow a fixed pattern: feed stimuli into an encoding model
              to obtain predicted cortical maps (for TRIBE v2, 20,484 vertices per sample), then
              train a classifier or run statistics to test whether representations differ across
              conditions. Empirical studies follow whatever pipeline fits the hypothesis and the
              recording setup. Each experiment page documents its own methods and limitations.
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
