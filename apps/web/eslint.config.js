import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    name: "web/react-three-fiber",
    files: [
      "components/hero-experience/atmosphere-field.tsx",
      "components/hero-experience/energy-core.tsx",
      "components/hero-experience/hero-particles.tsx",
      "components/hero-experience/logo-formation.tsx",
      "components/hero-experience/particle-field.tsx",
      "components/hero-experience/ribbon-system.tsx",
    ],
    rules: {
      /**
       * These components render React Three Fiber intrinsic
       * elements rather than DOM nodes. Their camel-cased
       * props are validated by TypeScript's ThreeElements.
       */
      "react/no-unknown-property": "off",
    },
  },
];
