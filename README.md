# l8c-ui

A small, standalone Angular UI component library by [Layer8 Consulting](https://l8c.io). It powers our own products such as [l8c-survey](https://github.com/Layer8ConsultingGmbH/l8c-survey) and is published to npm as [`@l8c/ui`](https://www.npmjs.com/package/@l8c/ui).

[![npm version](https://img.shields.io/npm/v/%40l8c%2Fui?logo=npm)](https://www.npmjs.com/package/@l8c/ui)
[![CI](https://github.com/Layer8ConsultingGmbH/l8c-ui/actions/workflows/ci-run-tests.yml/badge.svg)](https://github.com/Layer8ConsultingGmbH/l8c-ui/actions/workflows/ci-run-tests.yml)
[![Dependency Scan](https://github.com/Layer8ConsultingGmbH/l8c-ui/actions/workflows/ci-dependency-scan.yml/badge.svg)](https://github.com/Layer8ConsultingGmbH/l8c-ui/actions/workflows/ci-dependency-scan.yml)
[![Lint](https://github.com/Layer8ConsultingGmbH/l8c-ui/actions/workflows/ci-lint.yml/badge.svg)](https://github.com/Layer8ConsultingGmbH/l8c-ui/actions/workflows/ci-lint.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Built with:**

![AI-assisted](https://img.shields.io/badge/AI--assisted-8A2BE2)
![Angular](https://img.shields.io/badge/Angular%2022-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Sass](https://img.shields.io/badge/Sass-CC6699?logo=sass&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white)

- **Standalone components** under the `l8c-` selector prefix, no NgModules required
- **Signal-based API** (`input()` / `output()`), tree-shakeable and `sideEffects: false`
- **Themeable via CSS custom properties** with sensible built-in fallbacks, so it works out of the box and adapts to your design tokens
- **No runtime dependencies** besides Angular itself

## Installation

```bash
npm install @l8c/ui
```

Peer dependencies: `@angular/common` and `@angular/core` `^22.0.0`.

## Usage

Every component is standalone. Import it directly into the component that uses it:

```ts
import { Component } from '@angular/core';
import { ButtonComponent } from '@l8c/ui';

@Component({
  selector: 'app-save-bar',
  imports: [ButtonComponent],
  template: `
    <l8c-button action="primary" icon="save" (clicked)="save()">Save</l8c-button>
    <l8c-button action="ghost" (clicked)="cancel()">Cancel</l8c-button>
  `,
})
export class SaveBarComponent {
  save() {}
  cancel() {}
}
```

Supporting types such as `TableColumn`, `SelectOption` or `SideNavItem` are exported from the package root as well. The full public surface is listed in [public-api.ts](shared-components/projects/l8c-ui/src/public-api.ts).

## Components

| Component | Description |
| --- | --- |
| `l8c-button` | Button with actions (`primary`, `secondary`, `ghost`, `danger`, …), sizes, tones and optional icon |
| `l8c-card` | Content card container |
| `l8c-input` / `l8c-number-input` | Text and number form fields |
| `l8c-checkbox` / `l8c-radio` | Selection controls |
| `l8c-select` / `l8c-dropdown` | Option pickers |
| `l8c-search-field` | Search input |
| `l8c-table` | Data table with sorting and pageable data |
| `l8c-pagination` | Pagination controls |
| `l8c-carousel` / `l8c-carousel-slide` | Slide carousel |
| `l8c-dialog` / `l8c-confirm-dialog` | Modal dialogs |
| `l8c-navigation-bar` / `l8c-side-nav` | App navigation |
| `l8c-account-menu` | User account menu |
| `l8c-product-switcher` | Switch between platform products |
| `l8c-icon` | Icon component with bundled icon registry |
| `l8c-spinner` | Loading indicator |

## Theming

Components style themselves through CSS custom properties and ship with fallback values, so nothing needs to be configured to get started. To match your brand, define the tokens on `:root` (or any ancestor element) in your global stylesheet:

```css
:root {
  /* Colors */
  --primary: #2a7ab8;
  --primary-hover: #3d8ecb;
  --primary-dark: #1d5d92;
  --primary-rgb: 42, 122, 184;
  --on-primary: #ffffff;
  --bg: #0b1220;
  --surface: #121b2d;
  --surface-2: #0f1726;
  --surface-3: #1a2436;
  --text: #e6e9f2;
  --text-muted: #98a3b8;
  --text-faint: #5b6678;
  --border: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);
  --error: #e5484d;
  --success: #30a46c;
  --warning: #f5a524;

  /* Typography */
  --font-family: 'Inter', system-ui, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  /* Shape & spacing */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 999px;
  --space-2xs: 0.25rem;
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;

  /* Motion */
  --transition-fast: 120ms ease;
  --transition-base: 200ms ease;
}
```

Only override what you need. Search the component stylesheets under [shared-components/projects/l8c-ui/src](shared-components/projects/l8c-ui/src) for `var(--` to see every token a component reads.

## Compatibility

| `@l8c/ui` | Angular |
| --- | --- |
| 1.x | 22.x |

## Development

The Angular CLI workspace lives in [shared-components/](shared-components/):

```bash
cd shared-components
npm install
```

| Script | Purpose |
| --- | --- |
| `npm run build` | Production build of the library (output in `dist/l8c-ui`) |
| `npm run build:dev` | Development build |
| `npm run watch` | Rebuild on change (for local linking) |
| `npm test` | Run unit tests (Vitest) |
| `npm run pack` | Create a tarball from `dist/l8c-ui` |
| `npm run publish:local` | Build and pack in one step |

### Testing changes in a consuming app

Build and pack the library, then install the tarball in your app:

```bash
npm run publish:local
# in the consuming app:
npm install ../l8c-ui/shared-components/dist/l8c-ui/l8c-ui-<version>.tgz
```

## Releasing

Releases are published from the built output, not from the workspace root:

```bash
cd shared-components
npm run build
cd dist/l8c-ui
npm publish --access public
```

Before publishing, bump `version` in [projects/l8c-ui/package.json](shared-components/projects/l8c-ui/package.json) and add an entry to [CHANGELOG.md](CHANGELOG.md). npm rejects re-publishing an existing version.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and coding conventions, and note that this project follows a [Code of Conduct](CODE_OF_CONDUCT.md).

Found a security issue? Please follow the process in [SECURITY.md](SECURITY.md) instead of opening a public issue.

## License

[MIT](LICENSE) © 2026 Layer8 Consulting GmbH
