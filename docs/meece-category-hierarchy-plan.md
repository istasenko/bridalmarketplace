# MECE Category Hierarchy Implementation Plan

**Overall Progress:** `100%`

## TLDR

Replace the current flat category list with the MECE (Mutually Exclusive, Collectively Exhaustive) bridal hierarchy. Update `FilterBar` and `CreateListingForm` so users can browse and tag listings with the correct parent → subcategory structure.

---

## Critical Decisions

- **Hierarchy model**: Add optional `parentId` to `Category`. Listings always reference a leaf (subcategory) ID. Parent categories exist only for grouping in the UI.
- **Filter behavior**: When a user selects a parent category, show all listings whose subcategory belongs to that parent. When they select a subcategory, show only that subcategory.
- **UI for category selection**: Grouped dropdown (`<optgroup>`) in both FilterBar and CreateListingForm — one dropdown, parent labels as groups, subcategories as options. Keeps UI simple and familiar.
- **Migration**: Mock listings get `categoryId` remapped to new MECE subcategories. DB listings keep existing `category_id`; display as "Other" if ID no longer matches (or run a one-time migration script later).

---

## MECE Category Structure (Reference)

| Parent | Subcategories |
|--------|---------------|
| **Stationery** | Save the Dates, Invitations, Programs, Thank You Cards, Place Cards, Escort Cards, Menus (paper), Other Stationery |
| **Signage** | Welcome Signs, Table Numbers, Seating Charts, Ceremony Signs, Directional Signs, Bar & Drink Signs, Hashtag & Photo Signs, Other Signage |
| **Table Décor** | Centerpieces (non-floral), Table Runners, Tablecloths & Linens, Candle Holders & Candles, Vases, Chargers & Plates, Other Table Décor |
| **Florals** | Silk/Faux Arrangements, Dried Flowers, Garlands & Swags, Flower Girl Petals & Baskets, Bouquets & Boutonnieres (faux), Other Florals |
| **Ceremony Décor** | Arbors & Arches, Aisle Runners & Aisle Décor, Altar & Pew Décor, Unity Ceremony Items, Other Ceremony Décor |
| **Reception Décor** | Dance Floor Props, Backdrops & Photo Walls, Lighting, Lounge Décor, Other Reception Décor |
| **Favors & Gifts** | Guest Favors, Welcome Bag Items, Bridesmaid/Groomsman Gifts, Other Gifts |
| **Attire & Accessories** | Veils & Headpieces, Jewelry, Shoes, Hair Accessories, Garters, Other Attire & Accessories |
| **Props & Accents** | Ring Bearer Pillows, Cake Toppers, Cake Stands, Card Boxes & Guest Books, Champagne Flutes & Toasting Glasses, Photo Booth Props, Other Props |
| **Other** | Other |

---

## Tasks

- [x] 🟩 **Step 1: Update types and category data**
  - [x] 🟩 Add optional `parentId?: string` to `Category` in `types/listing.ts`
  - [x] 🟩 Replace `lib/mock/categories.ts` with full MECE hierarchy (parent categories + subcategories with `parentId`)
  - [x] 🟩 Add helpers: `getTopLevelCategories()`, `getSubcategories(parentId)`, `getCategoryById(id)`, `getParentCategory(category)` in `lib/listings.ts`

- [x] 🟩 **Step 2: Update FilterBar for hierarchical filtering**
  - [x] 🟩 Change category dropdown to use `<optgroup>` with parent labels; options are subcategories (leaf nodes)
  - [x] 🟩 URL param `category` continues to use slug; support both parent slugs and subcategory slugs
  - [x] 🟩 In `applyListingFilters` (and any server-side logic): when `category` slug matches a parent, include listings whose `categoryId` is any subcategory of that parent

- [x] 🟩 **Step 3: Update CreateListingForm for hierarchical tagging**
  - [x] 🟩 Replace flat category select with grouped dropdown (same `<optgroup>` pattern as FilterBar)
  - [x] 🟩 Sellers select a subcategory (leaf); `categoryId` stored is the subcategory ID
  - [x] 🟩 Ensure validation requires a valid leaf category ID

- [x] 🟩 **Step 4: Migrate mock listings and verify display**
  - [x] 🟩 Create mapping from old category IDs (1–8) to new MECE subcategory IDs
  - [x] 🟩 Update `lib/mock/listings.ts` with new `categoryId` values
  - [x] 🟩 Verify `ListingCard`, `ListingDetail` display correct category names (subcategory name, optionally with parent)

- [x] 🟩 **Step 5: API and listing display polish**
  - [x] 🟩 API route: optionally validate `categoryId` against known categories (return 400 if invalid)
  - [x] 🟩 Handle orphaned DB listings: when `categoryId` doesn’t match any category, display "Other"

---

## Out of Scope

- Supabase/categories table migration (categories stay in mock/constants for now)
- Style hierarchy (styles remain flat)
