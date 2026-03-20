"use client";

type ContactSellerButtonProps = {
  listingId: string;
  email: string;
  shouldTrack: boolean;
};

export default function ContactSellerButton({
  listingId,
  email,
  shouldTrack,
}: ContactSellerButtonProps) {
  const handleClick = () => {
    if (shouldTrack) {
      fetch(`/api/listings/${listingId}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "contact" }),
        credentials: "include",
      }).catch(() => {});
    }
  };

  return (
    <a
      href={`mailto:${email}`}
      onClick={handleClick}
      className="inline-block rounded-z bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
    >
      Contact seller
    </a>
  );
}
