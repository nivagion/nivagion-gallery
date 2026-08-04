import type { ArtworkWithImages } from "../types";

export type PaymentIntent = {
  mode: "redirect" | "manual-request";
  redirectUrl: string | null;
  instructions: string;
};

export interface PaymentProvider {
  createIntent(artwork: ArtworkWithImages): PaymentIntent;
}

export const revolutPlaceholderProvider: PaymentProvider = {
  createIntent(artwork) {
    if (artwork.revolut_payment_url) {
      return {
        mode: "redirect",
        redirectUrl: artwork.revolut_payment_url,
        instructions:
          "You will be redirected to the saved Revolut payment link. Payment confirmation may still be processed manually by the artist.",
      };
    }

    return {
      mode: "manual-request",
      redirectUrl: null,
      instructions:
        "Payment is not connected yet. The artist will send payment instructions separately after reviewing your request.",
    };
  },
};
