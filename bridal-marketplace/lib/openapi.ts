/**
 * OpenAPI 3.0 specification for the Ever After API.
 */
export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Ever After API",
    description:
      "API for Ever After — listings, shops, and user profile.\n\n**To authorize:** Click **Authorize**, choose **bearerAuth**, paste your access token. Get it by: 1) Log in at /login as a seller, 2) Open DevTools → Console, 3) Run the token script from the Postman collection description (or see /api/openapi).",
    version: "1.0.0",
  },
  servers: [
    { url: "http://localhost:3000", description: "Local development" },
  ],
  paths: {
    "/api/listings": {
      post: {
        summary: "Create a listing",
        description: "Create a new marketplace listing. Requires authenticated seller with a shop.",
        tags: ["Listings"],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description", "price", "condition", "categoryId", "styleIds", "imageUrls", "deliveryOption"],
                properties: {
                  title: { type: "string", example: "Acrylic Table Numbers 1–20" },
                  description: { type: "string", example: "Used once, great condition." },
                  price: { type: "number", example: 25 },
                  condition: {
                    type: "string",
                    enum: ["like new", "gently used", "used"],
                    description: "For reselling. Add 'new' for creator listings.",
                  },
                  categoryId: { type: "string", example: "signage-table-numbers" },
                  styleIds: {
                    type: "array",
                    items: { type: "string" },
                    example: ["1", "8"],
                    description: "Style IDs: 1=rustic, 2=modern, 3=garden, 5=classic, 6=vintage, 7=romantic, 8=minimalist, 9=kitschy",
                  },
                  imageUrls: { type: "array", items: { type: "string" }, description: "Public URLs of uploaded images" },
                  quantity: { type: "integer", default: 1 },
                  deliveryOption: {
                    type: "string",
                    enum: ["pickup_only", "ship_only", "both"],
                  },
                  listingKind: {
                    type: "string",
                    enum: ["reselling", "creator"],
                    default: "reselling",
                  },
                  creatorListingType: {
                    type: "string",
                    enum: ["handmade", "vintage", "craft_supplies"],
                    description: "Required when listingKind is 'creator'",
                  },
                  madeToOrder: { type: "boolean", default: false },
                  leadTimeDays: {
                    type: "integer",
                    minimum: 1,
                    maximum: 365,
                    description: "Required when madeToOrder is true",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Listing created",
            content: {
              "application/json": {
                schema: { type: "object", properties: { id: { type: "string", format: "uuid" } } },
              },
            },
          },
          "400": { description: "Validation error", content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } } },
          "401": { description: "Unauthorized — log in as a seller" },
          "403": { description: "Forbidden — set up your shop first" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/shops": {
      get: {
        summary: "Get current user's shop",
        description: "Returns the authenticated seller's shop. 401 if not logged in.",
        tags: ["Shops"],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          "200": {
            description: "Shop data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    shop: {
                      type: "object",
                      nullable: true,
                      properties: {
                        id: { type: "string" },
                        shop_name: { type: "string" },
                        shop_description: { type: "string", nullable: true },
                        location: { type: "string" },
                        zip: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        summary: "Create a shop",
        description: "Create a shop for the authenticated seller. Must not already have a shop.",
        tags: ["Shops"],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["shopName", "zip"],
                properties: {
                  shopName: { type: "string", example: "Bride's Treasures" },
                  shopDescription: { type: "string", example: "Pre-loved wedding items" },
                  zip: { type: "string", example: "10001", description: "NYC metro 5-digit zip" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Shop created",
            content: {
              "application/json": {
                schema: { type: "object", properties: { id: { type: "string", format: "uuid" } } },
              },
            },
          },
          "400": { description: "Validation error or shop already exists" },
          "401": { description: "Unauthorized" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/me": {
      get: {
        summary: "Get current user",
        description: "Returns the authenticated user's profile and shop (if seller).",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          "200": {
            description: "User profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    profile: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        role: { type: "string", enum: ["browser", "seller"] },
                        name: { type: "string" },
                        email: { type: "string" },
                        zip: { type: "string", nullable: true },
                      },
                    },
                    shop: { type: "object", nullable: true },
                    role: { type: "string", enum: ["browser", "seller"] },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "500": { description: "Server error" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Supabase access token. Log in at /login → DevTools Console → run the token extractor script (see collection docs) → paste the token here.",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "sb-access-token",
        description: "Session cookie (alternative). Log in via the app; browser sends cookies automatically.",
      },
    },
  },
};
