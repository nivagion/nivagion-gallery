"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { submitContactForm } from "../../app/contact/actions";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactForm, null);
  return (
    <form action={action} className="grid gap-4">
      {state?.message ? (
        <p className="border border-[#d7d0c5] px-4 py-3 text-sm text-[#4b4741]">{state.message}</p>
      ) : null}
      <label className="label">
        Name
        <input className="field" name="name" autoComplete="name" required />
      </label>
      <label className="label">
        Email
        <input className="field" name="email" type="email" autoComplete="email" required />
      </label>
      <label className="label">
        Subject
        <input className="field" name="subject" required />
      </label>
      <label className="label">
        Artwork reference
        <input className="field" name="artworkReference" />
      </label>
      <label className="label">
        Message
        <textarea className="field min-h-44" name="message" required />
      </label>
      <button className="button justify-self-start" disabled={pending}>
        <Send size={18} aria-hidden />
        {pending ? "Sending" : "Send message"}
      </button>
    </form>
  );
}
