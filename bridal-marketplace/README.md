# Ever After

A marketplace for brides to buy and sell wedding items, organized by **category** (table cards, menus, dance floor props, welcome sign, etc.) and **style** (rustic, modern, garden, etc.).

## Run locally

```bash
cd bridal-marketplace
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Browse** — Grid of listings with category and style tags
- **Filter** — By category (dropdown) and style (chips); filters are in the URL so you can share or bookmark
- **Listing detail** — Full description, price, condition, seller info, and “Contact seller” (mailto)
- **Sell** — Placeholder page for future “list an item” flow

## API docs

Swagger UI is available at `/api-docs` (e.g. [http://localhost:3000/api-docs](http://localhost:3000/api-docs)). Not linked in the main nav — for developer use. OpenAPI spec: `/api/openapi`.

## Tech

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Mock data in `lib/mock/`; data layer in `lib/listings.ts` (ready to swap for a database later)
