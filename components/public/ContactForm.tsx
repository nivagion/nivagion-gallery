"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { submitContactForm } from "../../app/contact/actions";
import type { Locale } from "../../lib/i18n-copy";
import { t } from "../../lib/i18n-copy";

export function ContactForm({ locale = "en" }: { locale?: Locale }) {
  const [state, action, pending] = useActionState(submitContactForm, null);
  const c = t(locale);
  return (
    <form action={action} className="grid gap-4">
      {state?.message ? (
        <p className="border border-[#084A24]/25 px-4 py-3 text-sm text-[#04261E]">{state.message}</p>
      ) : null}
      <label className="label">
        {c.contact.fields.name}
        <input className="field" name="name" autoComplete="name" required />
      </label>
      <label className="label">
        {c.contact.fields.email}
        <input className="field" name="email" type="email" autoComplete="email" required />
      </label>
      <label className="label">
        {c.contact.fields.subject}
        <input className="field" name="subject" required />
      </label>
      <label className="label">
        {c.contact.fields.artwork}
        <input className="field" name="artworkReference" />
      </label>
      <label className="label">
        {c.contact.fields.message}
        <textarea className="field min-h-44" name="message" required />
      </label>
      <button className="button justify-self-start" disabled={pending}>
        <Send size={18} aria-hidden />
        {pending ? c.contact.fields.sending : c.contact.fields.send}
      </button>
    </form>
  );
}
