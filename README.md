# The Story House — Website Redesign

This version redesigns the existing Next.js real-estate website around the supplied **The Story House** brochure and 35 visual assets.

## Visual direction
- Editorial luxury-residential aesthetic
- Warm ivory, charcoal, walnut and champagne-gold palette
- Large architectural photography and lifestyle-led storytelling
- Responsive navigation and mobile layouts
- Interactive 2 & 3 BHK floor-plan explorer
- Dedicated sections for Story, Residences, Amenities, Everyday Life, Connectivity, Gallery and Specifications
- Existing `/contact`, `/properties`, admin and backend routes are preserved

## Run locally

```bash
npm install
npm run dev
```

Backend (when needed):

```bash
cd server
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and `server/.env.example` to `server/.env`, then add your own environment values.

## Verification

The redesigned code passes TypeScript type-checking and ESLint with no errors. A production build could not be completed in the supplied environment because Next.js attempted to download its Linux SWC binary and external package downloads were unavailable.
