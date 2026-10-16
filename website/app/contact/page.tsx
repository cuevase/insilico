import Navbar from '@/components/navbar'
import { CONTACT_EMAIL, SITE_NAME } from '@/lib/site'

export const metadata = {
  title: `Contact — ${SITE_NAME}`,
  description:
    'Reach out for questions about experiment methods, code access, and collaboration.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="site-wrap max-w-3xl py-16 md:py-24">
        <p className="section-label mb-4">Start a conversation</p>
        <h1 className="text-5xl font-medium tracking-[-.05em] text-foreground mb-10 text-balance md:text-6xl">
          Contact
        </h1>

        <div className="space-y-6 text-base text-foreground/85 leading-relaxed">
          <p>
            {SITE_NAME} is an independent research space. I am happy to hear from researchers,
            students, and collaborators who want to discuss the experiments, their methods, or
            future directions.
          </p>
          <p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-foreground font-medium underline underline-offset-4 hover:text-accent transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
