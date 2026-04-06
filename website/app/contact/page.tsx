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
      <main className="mx-auto max-w-2xl px-6 py-24">
        <h1 className="font-serif text-4xl font-medium text-foreground mb-10 text-balance">
          Contact
        </h1>

        <div className="space-y-6 text-base text-foreground/85 leading-relaxed">
          <p>
            {SITE_NAME} is a private research workspace. The code and full experiment pipelines are
            not public, but I am happy to hear from researchers, students, or collaborators who want
            to understand how the experiments were run, discuss methods, or request access where
            appropriate.
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
