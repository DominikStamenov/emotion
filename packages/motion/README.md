# eMotion Motion

The shared interaction and animation contract for the eMotion platform. It
centralizes reduced-motion behavior and reusable choreography so each product
does not invent different timing or accessibility rules.

Available primitives:

- `MotionProvider` and `useMotionPreference`;
- `useReducedMotion`;
- `Reveal`;
- `Magnetic`;
- `ImpactLink`;
- pure timeline helpers used by the Hero engine and unit tests.

Wrap an application with `MotionProvider`, then compose the smallest appropriate
primitive. Every new motion component must remain usable with reduced motion and
must avoid hiding essential content before JavaScript initializes.

```bash
pnpm --filter @repo/motion lint
pnpm --filter @repo/motion check-types
pnpm test -- tests/motion.test.ts
```
