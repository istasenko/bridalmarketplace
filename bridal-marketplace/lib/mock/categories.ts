import type { Category } from "@/types/listing";

/**
 * MECE category hierarchy for Ever After.
 * Listings reference leaf (subcategory) IDs. Parent categories group for display/filtering.
 */
export const categories: Category[] = [
  // --- Stationery (paper correspondence / per-guest info) ---
  { id: "stationery", slug: "stationery", name: "Stationery" },
  { id: "stationery-save-the-dates", slug: "save-the-dates", name: "Save the Dates", parentId: "stationery" },
  { id: "stationery-invitations", slug: "invitations", name: "Invitations", parentId: "stationery" },
  { id: "stationery-programs", slug: "programs", name: "Programs", parentId: "stationery" },
  { id: "stationery-thank-you-cards", slug: "thank-you-cards", name: "Thank You Cards", parentId: "stationery" },
  { id: "stationery-place-cards", slug: "place-cards", name: "Place Cards", parentId: "stationery" },
  { id: "stationery-escort-cards", slug: "escort-cards", name: "Escort Cards", parentId: "stationery" },
  { id: "stationery-menus-paper", slug: "menus-paper", name: "Menus (paper)", parentId: "stationery" },
  { id: "stationery-other", slug: "stationery-other", name: "Other Stationery", parentId: "stationery" },

  // --- Signage (displays info in the space) ---
  { id: "signage", slug: "signage", name: "Signage" },
  { id: "signage-welcome-signs", slug: "welcome-signs", name: "Welcome Signs", parentId: "signage" },
  { id: "signage-table-numbers", slug: "table-numbers", name: "Table Numbers", parentId: "signage" },
  { id: "signage-seating-charts", slug: "seating-charts", name: "Seating Charts", parentId: "signage" },
  { id: "signage-ceremony-signs", slug: "ceremony-signs", name: "Ceremony Signs", parentId: "signage" },
  { id: "signage-directional-signs", slug: "directional-signs", name: "Directional Signs", parentId: "signage" },
  { id: "signage-bar-drink-signs", slug: "bar-drink-signs", name: "Bar & Drink Signs", parentId: "signage" },
  { id: "signage-hashtag-photo-signs", slug: "hashtag-photo-signs", name: "Hashtag & Photo Signs", parentId: "signage" },
  { id: "signage-other", slug: "signage-other", name: "Other Signage", parentId: "signage" },

  // --- Table Décor (non-floral tabletop décor) ---
  { id: "table-decor", slug: "table-decor", name: "Table Décor" },
  { id: "table-decor-centerpieces", slug: "table-decor-centerpieces", name: "Centerpieces (non-floral)", parentId: "table-decor" },
  { id: "table-decor-runners", slug: "table-runners", name: "Table Runners", parentId: "table-decor" },
  { id: "table-decor-linens", slug: "tablecloths-linens", name: "Tablecloths & Linens", parentId: "table-decor" },
  { id: "table-decor-candles", slug: "candle-holders-candles", name: "Candle Holders & Candles", parentId: "table-decor" },
  { id: "table-decor-vases", slug: "vases", name: "Vases", parentId: "table-decor" },
  { id: "table-decor-chargers", slug: "chargers-plates", name: "Chargers & Plates", parentId: "table-decor" },
  { id: "table-decor-other", slug: "table-decor-other", name: "Other Table Décor", parentId: "table-decor" },

  // --- Florals ---
  { id: "florals", slug: "florals", name: "Florals" },
  { id: "florals-silk-faux", slug: "silk-faux-arrangements", name: "Silk/Faux Arrangements", parentId: "florals" },
  { id: "florals-dried", slug: "dried-flowers", name: "Dried Flowers", parentId: "florals" },
  { id: "florals-garlands", slug: "garlands-swags", name: "Garlands & Swags", parentId: "florals" },
  { id: "florals-flower-girl", slug: "flower-girl-petals-baskets", name: "Flower Girl Petals & Baskets", parentId: "florals" },
  { id: "florals-bouquets", slug: "bouquets-boutonnieres", name: "Bouquets & Boutonnieres (faux)", parentId: "florals" },
  { id: "florals-other", slug: "florals-other", name: "Other Florals", parentId: "florals" },

  // --- Ceremony Décor ---
  { id: "ceremony-decor", slug: "ceremony-decor", name: "Ceremony Décor" },
  { id: "ceremony-decor-arbors", slug: "arbors-arches", name: "Arbors & Arches", parentId: "ceremony-decor" },
  { id: "ceremony-decor-aisle", slug: "aisle-runners-decor", name: "Aisle Runners & Aisle Décor", parentId: "ceremony-decor" },
  { id: "ceremony-decor-altar", slug: "altar-pew-decor", name: "Altar & Pew Décor", parentId: "ceremony-decor" },
  { id: "ceremony-decor-unity", slug: "unity-ceremony-items", name: "Unity Ceremony Items", parentId: "ceremony-decor" },
  { id: "ceremony-decor-other", slug: "ceremony-decor-other", name: "Other Ceremony Décor", parentId: "ceremony-decor" },

  // --- Reception Décor ---
  { id: "reception-decor", slug: "reception-decor", name: "Reception Décor" },
  { id: "reception-decor-dance-floor", slug: "dance-floor-props", name: "Dance Floor Props", parentId: "reception-decor" },
  { id: "reception-decor-backdrops", slug: "backdrops-photo-walls", name: "Backdrops & Photo Walls", parentId: "reception-decor" },
  { id: "reception-decor-lighting", slug: "lighting", name: "Lighting", parentId: "reception-decor" },
  { id: "reception-decor-lounge", slug: "lounge-decor", name: "Lounge Décor", parentId: "reception-decor" },
  { id: "reception-decor-other", slug: "reception-decor-other", name: "Other Reception Décor", parentId: "reception-decor" },

  // --- Favors & Gifts ---
  { id: "favors-gifts", slug: "favors-gifts", name: "Favors & Gifts" },
  { id: "favors-gifts-guest", slug: "guest-favors", name: "Guest Favors", parentId: "favors-gifts" },
  { id: "favors-gifts-welcome", slug: "welcome-bag-items", name: "Welcome Bag Items", parentId: "favors-gifts" },
  { id: "favors-gifts-wedding-party", slug: "bridesmaid-groomsman-gifts", name: "Bridesmaid/Groomsman Gifts", parentId: "favors-gifts" },
  { id: "favors-gifts-other", slug: "favors-gifts-other", name: "Other Gifts", parentId: "favors-gifts" },

  // --- Attire & Accessories ---
  { id: "attire-accessories", slug: "attire-accessories", name: "Attire & Accessories" },
  { id: "attire-accessories-veils", slug: "veils-headpieces", name: "Veils & Headpieces", parentId: "attire-accessories" },
  { id: "attire-accessories-jewelry", slug: "jewelry", name: "Jewelry", parentId: "attire-accessories" },
  { id: "attire-accessories-shoes", slug: "shoes", name: "Shoes", parentId: "attire-accessories" },
  { id: "attire-accessories-hair", slug: "hair-accessories", name: "Hair Accessories", parentId: "attire-accessories" },
  { id: "attire-accessories-garters", slug: "garters", name: "Garters", parentId: "attire-accessories" },
  { id: "attire-accessories-other", slug: "attire-accessories-other", name: "Other Attire & Accessories", parentId: "attire-accessories" },

  // --- Props & Accents ---
  { id: "props-accents", slug: "props-accents", name: "Props & Accents" },
  { id: "props-accents-ring-pillow", slug: "ring-bearer-pillows", name: "Ring Bearer Pillows", parentId: "props-accents" },
  { id: "props-accents-cake-topper", slug: "cake-toppers", name: "Cake Toppers", parentId: "props-accents" },
  { id: "props-accents-cake-stand", slug: "cake-stands", name: "Cake Stands", parentId: "props-accents" },
  { id: "props-accents-card-guest", slug: "card-boxes-guest-books", name: "Card Boxes & Guest Books", parentId: "props-accents" },
  { id: "props-accents-champagne", slug: "champagne-flutes-toasting", name: "Champagne Flutes & Toasting Glasses", parentId: "props-accents" },
  { id: "props-accents-photo-booth", slug: "photo-booth-props", name: "Photo Booth Props", parentId: "props-accents" },
  { id: "props-accents-other", slug: "props-accents-other", name: "Other Props", parentId: "props-accents" },

  // --- Other ---
  { id: "other", slug: "other", name: "Other" },
];
