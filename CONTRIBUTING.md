# Contributing to l8c-ui

Thanks for your interest in contributing. This document explains how to get set up, how we work, and what we expect from a pull request.

## Getting started

Requirements: Node.js 22 or newer and npm 11.

```bash
git clone https://github.com/Layer8ConsultingGmbH/l8c-ui.git
cd l8c-ui/shared-components
npm install
npm run build
npm test
```

The Angular CLI workspace lives in `shared-components/`; the library source is in `shared-components/projects/l8c-ui/src`.

## Reporting bugs and requesting features

Open an issue on GitHub using the matching template. For bugs, include the `@l8c/ui` and Angular versions, a minimal reproduction and the expected vs. actual behaviour.

Please do **not** report security vulnerabilities in public issues. See [SECURITY.md](SECURITY.md).

## Making changes

1. Fork the repository and create a branch from `main` (`feat/…`, `fix/…`, `docs/…`).
2. Keep pull requests focused. One change per PR is much easier to review than several unrelated ones.
3. Add or update unit tests for behaviour you change. Every component has a `*.spec.ts` next to it.
4. Run `npm run build` and `npm test` in `shared-components/` before pushing.
5. Update `CHANGELOG.md` under **Unreleased** when the change is user-visible.
6. Open the pull request against `main` and fill in the template.

For larger changes or new components, open an issue first so we can agree on the API before you invest time.

## Coding conventions

- **Standalone components only.** No NgModules.
- **Signals API.** Use `input()`, `output()`, `model()` and `computed()` rather than decorators.
- **Selector prefix** is `l8c-`. Component files follow the Angular CLI layout (`name/name.component.{ts,html,scss,spec.ts}`).
- **Public API.** Anything consumers should import must be exported from `src/public-api.ts`. Export supporting types with `export type`.
- **Styling.** Use CSS custom properties with a fallback (`var(--primary, #2a7ab8)`) so components work without a theme and pick up the host application's tokens when present. Avoid global styles.
- **Formatting.** Prettier is configured in `shared-components/package.json` (single quotes, 100 columns). Run `npx prettier --write "projects/**/*.{ts,html,scss}"` in `shared-components/` before committing; CI rejects unformatted code.
- **Accessibility.** Interactive components need keyboard support and appropriate ARIA attributes.
- **No new runtime dependencies** without discussion. The library intentionally depends only on Angular.

## Commit messages

Use short, imperative subjects (`add tone input to button`, `fix table sort on nullable columns`). Reference issues where applicable (`fixes #12`).

## Releasing (maintainers)

1. Bump `version` in `shared-components/projects/l8c-ui/package.json` following [Semantic Versioning](https://semver.org/).
2. Move the **Unreleased** entries in `CHANGELOG.md` under the new version and date.
3. Merge the pull request into `main`.

The publish workflow (`.github/workflows/cd-publish-npm.yml`) detects the new version, builds and tests the library, publishes it to npm and creates the `vX.Y.Z` tag and GitHub release automatically.

## License

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE).
