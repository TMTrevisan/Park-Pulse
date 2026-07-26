import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated files and one-off maintenance utilities are not application source.
    "public/sw.js",
    "public/workbox-*.js",
    "scripts/**",
    "src/scripts/**",
    "fetch-exact-coords.js",
    "fix-coords.js",
    "fix-coords.ts",
  ]),
]);

export default eslintConfig;
