/**
 * ─────────────────────────────────────────────────────────────
 *  CONTACT FORM — free, no backend.
 *
 *  Default: FormSubmit (https://formsubmit.co) — no key, no account.
 *   • The very first message sent through the live site triggers an
 *     "Activate form" email to the address below. Click the link in that
 *     email once; every message after that arrives in your inbox.
 *
 *  Optional: Web3Forms (https://web3forms.com). If you paste an access key
 *  below, the form uses Web3Forms instead of FormSubmit.
 * ─────────────────────────────────────────────────────────────
 */
export const contactForm = {
  /** Where messages are delivered. */
  inbox: 'nakibhasan2711@gmail.com',

  /** Leave empty to use FormSubmit. Paste a Web3Forms key to switch to Web3Forms. */
  web3formsAccessKey: '',

  /** Subject line of the emails you receive. */
  subject: 'New message from your portfolio',
  /** Shown next to your name in the inbox (Web3Forms only). */
  fromName: 'Portfolio contact form',
}
