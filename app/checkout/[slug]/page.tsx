import { permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/contact?artwork=${encodeURIComponent(slug)}`);
}
