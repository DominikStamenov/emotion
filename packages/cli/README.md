# eMotion CLI

The first-party generator for the eMotion product platform.

```bash
pnpm emotion doctor
pnpm emotion create partner-portal --surface=portal --dry-run
pnpm emotion generate status-card --package=ui --dry-run
```

The CLI resolves the monorepo root, rejects unsafe paths and never overwrites an
existing file unless `--force` is explicitly supplied.
