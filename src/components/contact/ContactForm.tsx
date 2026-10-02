import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { contactForm } from '../../data/contact'
import { profile } from '../../data/profile'

type Status = 'idle' | 'sending' | 'sent' | 'activation' | 'error'
interface Fields {
  name: string
  email: string
  message: string
}
type Errors = Partial<Record<keyof Fields, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(f: Fields): Errors {
  const e: Errors = {}
  if (f.name.trim().length < 2) e.name = 'Please enter your name.'
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'Please enter a valid email address.'
  if (f.message.trim().length < 10) e.message = 'Please write at least a short message (10+ characters).'
  return e
}

/**
 * Contact form. Sends through FormSubmit by default, or Web3Forms when an
 * access key is configured (see src/data/contact.ts).
 */
export function ContactForm() {
  const id = useId()
  const [fields, setFields] = useState<Fields>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState('')

  const update = (key: keyof Fields) => (value: string) => {
    setFields((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const found = validate(fields)
    setErrors(found)
    const firstInvalid = (Object.keys(found) as (keyof Fields)[])[0]
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }
    // Honeypot: real people never tick this hidden box.
    if ((form.elements.namedItem('botcheck') as HTMLInputElement | null)?.checked) return

    setStatus('sending')
    setServerError('')
    const name = fields.name.trim()
    const email = fields.email.trim()
    const message = fields.message.trim()
    try {
      if (contactForm.web3formsAccessKey) {
        // Web3Forms (used only when an access key is configured)
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: contactForm.web3formsAccessKey,
            subject: contactForm.subject,
            from_name: contactForm.fromName,
            name,
            email,
            replyto: email,
            message,
          }),
        })
        const data = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string }
        if (!res.ok || !data.success) throw new Error(data.message || `Request failed (${res.status})`)
      } else {
        // FormSubmit — no key needed; the inbox owner activates it once by email.
        const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(contactForm.inbox)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name,
            email,
            message,
            _subject: contactForm.subject,
            _replyto: email,
            _template: 'table',
            _captcha: 'false',
          }),
        })
        const data = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string }
        const ok = data.success === true || data.success === 'true'
        if (!res.ok || !ok) {
          // Before activation FormSubmit replies with an explanation instead of sending.
          if (data.message && /activat/i.test(data.message)) {
            setStatus('activation')
            return
          }
          throw new Error(data.message || `Request failed (${res.status})`)
        }
      }
      setStatus('sent')
      setFields({ name: '', email: '', message: '' })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('error')
    }
  }

  /** Last resort if the form service is unreachable: open a pre-filled email draft. */
  const openMailDraft = () => {
    const body = `${fields.message.trim()}

— ${fields.name.trim()} (${fields.email.trim()})`
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(contactForm.subject)}&body=${encodeURIComponent(body)}`
  }

  const input =
    'w-full rounded-xl border bg-ink-950/50 px-4 py-3 text-[15px] text-fg placeholder:text-fg-subtle transition-colors duration-300 outline-none focus:border-accent/70 focus:bg-ink-950/70 focus-visible:outline-none'
  const border = (k: keyof Fields) => (errors[k] ? 'border-red-400/70' : 'border-line/[0.12] hover:border-line/25')

  return (
    <form noValidate onSubmit={onSubmit} className="relative rounded-3xl border border-line/[0.1] bg-ink-850/95 p-5 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)] backdrop-blur-xl sm:p-7" aria-describedby={`${id}-status`}>
      <p className="font-mono text-[11px] tracking-[0.18em] text-fg-subtle uppercase">Send a message</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field id={`${id}-name`} label="Name" error={errors.name}>
          <input
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            value={fields.name}
            onChange={(e) => update('name')(e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
            placeholder="Your name"
            className={`${input} ${border('name')}`}
          />
        </Field>
        <Field id={`${id}-email`} label="Email" error={errors.email}>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={fields.email}
            onChange={(e) => update('email')(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${id}-email-error` : undefined}
            placeholder="you@company.com"
            className={`${input} ${border('email')}`}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field id={`${id}-message`} label="Message" error={errors.message}>
          <textarea
            id={`${id}-message`}
            name="message"
            rows={5}
            value={fields.message}
            onChange={(e) => update('message')(e.target.value)}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? `${id}-message-error` : undefined}
            placeholder="Tell me about the role, product or question…"
            className={`${input} ${border('message')} resize-y`}
          />
        </Field>
      </div>

      {/* Honeypot — hidden from people and assistive tech, bots fill it in. */}
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-on-accent shadow-[0_8px_30px_-8px_rgb(196_122_85/0.6)] transition-colors hover:bg-accent-soft disabled:cursor-wait disabled:opacity-70"
        >
          {status === 'sending' ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Sending…
            </>
          ) : (
            <>
              Send message <Send size={15} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </>
          )}
        </button>
        <p className="text-xs text-fg-subtle">Goes straight to my inbox.</p>
      </div>

      <div id={`${id}-status`} role="status" aria-live="polite" className="min-h-0">
        <AnimatePresence>
          {(status === 'sent' || status === 'activation' || status === 'error') && (
            <motion.p
              key={status}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
                status === 'error' ? 'border-red-400/40 bg-red-400/[0.06] text-fg' : 'border-accent/35 bg-accent/[0.07] text-fg'
              }`}
            >
              {status === 'error' ? (
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" aria-hidden="true" />
              ) : (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              )}
              <span>
                {status === 'sent' && 'Thanks — your message has been sent. I’ll get back to you soon.'}
                {status === 'activation' &&
                  'The form was just set up: an activation email has been sent to the site owner. Once it’s confirmed, messages are delivered — please try again shortly, or email directly.'}
                {status === 'error' && (
                  <>
                    Sorry, the message couldn’t be sent ({serverError}).{' '}
                    <button type="button" onClick={openMailDraft} className="font-medium text-accent underline underline-offset-2">
                      Open it in your email app instead
                    </button>
                    .
                  </>
                )}
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-fg-muted">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
