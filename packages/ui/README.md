# eMotion UI

The shared React design-system package for eMotion Studio, CMS, Client Portal
and OS. It owns accessible controls, reusable product surfaces and the design
tokens consumed by every application.

Available components:

- `Badge`;
- `Button` with native button and link modes;
- `Card`;
- `Code`;
- `Field`, `Input` and `Textarea`.

```bash
pnpm storybook
pnpm storybook:build
pnpm --filter @repo/ui lint
pnpm --filter @repo/ui check-types
```

Import `@repo/ui/tokens.css` once in each application root. New components must
export their public props from `src/index.ts`, include accessible states and add
a Storybook story before they become part of the shared API.
