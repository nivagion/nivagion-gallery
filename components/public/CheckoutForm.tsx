"use client";

import { useActionState } from "react";
import { submitCheckout } from "../../app/checkout/[slug]/actions";
import type { Locale } from "../../lib/i18n-copy";
import { t } from "../../lib/i18n-copy";

export function CheckoutForm({ slug, locale = "en" }: { slug: string; locale?: Locale }) {
  const [state, action, pending] = useActionState(submitCheckout.bind(null, slug), null);
  const c = t(locale);
  return (
    <form action={action} className="grid gap-4">
      {state?.message ? (
        <p className="border border-[#084A24]/25 px-4 py-3 text-sm text-[#04261E]">{state.message}</p>
      ) : null}
      <label className="label">
        {c.checkout.fullName}
        <input className="field" name="fullName" autoComplete="name" required />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="label">
          Email
          <input className="field" name="email" type="email" autoComplete="email" required />
        </label>
        <label className="label">
          {c.checkout.phone}
          <input className="field" name="telephone" autoComplete="tel" required />
        </label>
      </div>
      <label className="label">
        {c.checkout.street}
        <input className="field" name="streetAddress" autoComplete="street-address" required />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="label">
          {c.checkout.postal}
          <input className="field" name="postalCode" autoComplete="postal-code" required />
        </label>
        <label className="label sm:col-span-2">
          {c.checkout.city}
          <input className="field" name="city" autoComplete="address-level2" required />
        </label>
      </div>
      <label className="label">
        {c.checkout.country}
        <input className="field" name="country" autoComplete="country-name" defaultValue="Croatia" required />
      </label>
      <label className="label">
        {c.checkout.delivery}
        <textarea className="field min-h-28" name="deliveryNote" />
      </label>
      <button className="button justify-self-start" disabled={pending}>
        {pending ? c.checkout.submitting : c.checkout.submit}
      </button>
    </form>
  );
}
