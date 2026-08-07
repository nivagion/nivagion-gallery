export type ArtworkStatus = "draft" | "available" | "reserved" | "sold" | "not_available" | "archived";
export type PaymentStatus = "request" | "pending" | "paid" | "cancelled" | "refunded";
export type FulfilmentStatus = "unfulfilled" | "shipped" | "cancelled" | "refunded";

export type Artwork = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  year: number | null;
  medium: string;
  surface: string | null;
  width_cm: number | null;
  height_cm: number | null;
  description: string | null;
  price_cents: number | null;
  currency: string;
  status: ArtworkStatus;
  is_featured: boolean;
  is_published: boolean;
  manual_sort_order: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  reserved_until: string | null;
  revolut_payment_url: string | null;
};

export type ArtworkImage = {
  id: string;
  artwork_id: string;
  object_key: string;
  alt_text: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  file_type: string;
  file_size: number;
  display_order: number;
  is_primary: boolean;
  created_at: string;
};

export type ArtworkWithImages = Artwork & {
  images: ArtworkImage[];
};

export type Order = {
  id: string;
  public_reference: string;
  artwork_id: string;
  customer_full_name: string;
  email: string;
  telephone: string;
  street_address: string;
  postal_code: string;
  city: string;
  country: string;
  delivery_note: string | null;
  artwork_price_cents: number;
  shipping_price_cents: number;
  total_price_cents: number;
  currency: string;
  payment_method: string;
  payment_status: PaymentStatus;
  fulfilment_status: FulfilmentStatus;
  revolut_payment_url_used: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  artwork_title?: string;
  artwork_slug?: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  artwork_reference: string | null;
  ip_hash: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type SiteSettings = {
  siteDescription: string;
  siteDescriptionHr: string;
  contactEmail: string;
  homepageIntroduction: string;
  homepageIntroductionHr: string;
  artistBiography: string;
  artistBiographyHr: string;
  studioLocationWording: string;
  defaultShippingMessage: string;
  defaultShippingMessageHr: string;
  croatianShippingCents: number;
  internationalShippingMode: string;
  announcementText: string;
  instagramUrl: string;
  otherSocialUrl: string;
  returnConditions: string;
  commissionAvailability: string;
  commissionAvailabilityHr: string;
  customDomainEmail: string;
  legalSellerInformation: string;
  croatianBusinessTaxInformation: string;
};
