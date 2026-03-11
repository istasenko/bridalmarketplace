export type Category = {
  id: string;
  slug: string;
  name: string;
  /** Parent category id; undefined for top-level. Listings always use leaf (subcategory) ids. */
  parentId?: string;
};

export type Style = {
  id: string;
  slug: string;
  name: string;
};

export type Seller = {
  name: string;
  location: string;
  /** Zip code (e.g. 10001) for display and distance filtering */
  zip?: string;
  contactEmail: string;
  /** Latitude/longitude for distance filtering */
  lat?: number;
  lng?: number;
};

export type DeliveryOption = "pickup_only" | "ship_only" | "both";

export type ListingKind = "reselling" | "creator";

export type CreatorListingType = "handmade" | "vintage" | "craft_supplies";

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: "new" | "like new" | "gently used" | "used";
  categoryId: string;
  styleIds: string[];
  imageUrls: string[];
  seller: Seller;
  /** Number of units (e.g. 20 table cards). Default 1. */
  quantity?: number;
  /** How buyer can receive: pickup only, ship only, or both. */
  deliveryOption?: DeliveryOption;
  /** @deprecated Use deliveryOption. True if can be shipped (ship_only or both). */
  ships?: boolean;
  /** Reselling (pre-owned) vs creator (handmade/vintage/supplies). Default reselling. */
  listingKind?: ListingKind;
  /** For creator listings: handmade, vintage, or craft supplies. */
  creatorListingType?: CreatorListingType;
  /** For creator: item is made to order. */
  madeToOrder?: boolean;
  /** For creator: days until ready when made to order. */
  leadTimeDays?: number;
  createdAt: string;
};

export type ListingFilters = {
  category?: string;
  style?: string;
  /** User's zip code for distance filter */
  zip?: string;
  /** Max miles willing to drive; only applied when zip is set */
  maxMiles?: number;
  /** When true, include listings that can be shipped even if outside maxMiles */
  includeShippable?: boolean;
};
