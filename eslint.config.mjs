import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // The hero chamber scene animates dozens of decorative SVG art pieces with
  // GSAP transforms, so it renders plain <img> (no next/image wrapper). The
  // hands chapter's flanking portraits are driven the same way.
  {
    files: ["components/home/Hero/**/*.tsx", "components/home/Hands/**/*.tsx"],
    rules: { "@next/next/no-img-element": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Static assets / vendored decoders are never imported as modules.
    "public/**",
  ]),
]);

export default eslintConfig;
