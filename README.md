# Create a GitHub Action Using TypeScript

[![GitHub Super-Linter](https://github.com/KinNeko-De/cleanup-outdated-tag-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/KinNeko-De/cleanup-outdated-tag-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/KinNeko-De/cleanup-outdated-tag-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/KinNeko-De/cleanup-outdated-tag-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/KinNeko-De/cleanup-outdated-tag-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/KinNeko-De/cleanup-outdated-tag-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Comming soon...
[read my article for a short introduction at the end](https://medium.com/@kinneko-de/7d17fa85c175)

## Usage
Warning: this is a v0 pre-release. The action's inputs, outputs and behavior are experimental and may change without notice.

``` yaml
      - name: Delete outdated git tags
        uses: KinNeko-De/cleanup-outdated-tag-action@v0
```

## Build / Committing dist/

This repository ships a compiled JavaScript bundle in `dist/` (built from the
TypeScript `src/` files) which is what GitHub runs when someone uses the action.

Before creating a PR or pushing changes that touch `src/` or the build
toolchain, regenerate the `dist/` output and commit it so CI and consumers see
the expected code:

```bash
# rebuild the compiled action bundle
npm run bundle
```

The repository contains a CI check (`.github/workflows/check-dist.yml`) that
rebuilds `dist/` and fails the PR if the checked-in `dist/` does not match the
build output. Keeping `dist/` in sync avoids that failure and ensures consumers
of the action run the correct code.

## Format with Prettier

Please format the repository before committing by running: to avoid headache for
the developer that focus on features instead of line formating

```bash
npx prettier --write .
```

This will apply the project's Prettier rules to all files. CI runs a formatting
check for code files; running the command above locally ensures docs and other
files are formatted too and prevents CI failures.
