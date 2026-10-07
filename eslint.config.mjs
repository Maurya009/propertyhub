import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Admin CMS pages use client-side data loaders inside effects.
  // These effects intentionally update local React state after async API calls.
  {
    files: [
      "app/admin/amenities/page.tsx",
      "app/admin/enquiries/page.tsx",
      "app/admin/gallery/page.tsx",
      "app/admin/location/page.tsx",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },

  // The Express/Mongoose backend is CommonJS-based.
  {
    files: ["server/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
