"use client";

import { useActionState } from "react";
import { submitCheckout } from "../../app/checkout/[slug]/actions";

export function CheckoutForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(submitCheckout.bind(null, slug), null);
  return (
    <form action={action} className="grid gap-4">
      {state?.message ? (
        <p className="border border-[#d7d0c5] px-4 py-3 text-sm text-[#4b4741]">{state.message}</p>
      ) : null}
      <label className="label">
        Full name
        <input className="field" name="fullName" autoComplete="name" required />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="label">
          Email
          <input className="field" name="email" type="email" autoComplete="email" required />
        </label>
        <label className="label">
          Phone
          <input className="field" name="telephone" autoComplete="tel" required />
        </label>
      </div>
      <label className="label">
        Street address
        <input className="field" name="streetAddress" autoComplete="street-address" required />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="label">
          Postal code
          <input className="field" name="postalCode" autoComplete="postal-code" required />
        </label>
        <label className="label sm:col-span-2">
          City
          <input className="field" name="city" autoComplete="address-level2" required />
        </label>
      </div>
      <label className="label">
        Country
        <input className="field" name="country" autoComplete="country-name" defaultValue="Croatia" required />
      </label>
      <label className="label">
        Delivery note
        <textarea className="field min-h-28" name="deliveryNote" />
      </label>
      <button className="button justify-self-start" disabled={pending}>
        {pending ? "Submitting" : "Submit purchase request"}
      </button>
    </form>
  );
}
