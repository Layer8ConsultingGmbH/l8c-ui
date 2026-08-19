# l8c-ui

Shared Angular UI component library for Layer8 Consulting applications (e.g. l8c-survey, l8c-toolbox).

The library is built with Angular 22, ships standalone components under the `l8c-` selector prefix, and is published to npm as [`@l8c/ui`](https://www.npmjs.com/package/@l8c/ui).

## Components

| Component | Description |
| --- | --- |
| `l8c-button` | Button with actions, sizes, tones and optional icon |
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

All components and their supporting types (e.g. `TableColumn`, `SelectOption`, `SideNavItem`) are exported from the package root — see [public-api.ts](shared-components/projects/l8c-ui/src/public-api.ts).

## Installation

```bash
npm install @l8c/ui
```

Peer dependencies: `@angular/common` and `@angular/core` (>= 22).

## Usage

Components are standalone — import them directly where needed:

```ts
import { ButtonComponent } from '@l8c/ui';

@Component({
  imports: [ButtonComponent],
  template: `<l8c-button (click)="save()">Save</l8c-button>`,
})
export class MyComponent {}
```

## Development

The Angular workspace lives in [shared-components/](shared-components/):

```bash
cd shared-components
npm install
```

| Script | Purpose |
| --- | --- |
| `npm run build` | Production build of the library (output in `dist/l8c-ui`) |
| `npm run build:dev` | Development build |
| `npm run watch` | Rebuild on change (for local linking) |
| `npm run test` | Run unit tests (Vitest) |
| `npm run pack` | Create a tarball from `dist/l8c-ui` |
| `npm run publish:local` | Build and pack in one step |

### Local testing in a consuming app

Build and pack the library, then install the tarball in the consuming project:

```bash
npm run publish:local
# in the consuming app:
npm install ../l8c-ui/shared-components/dist/l8c-ui/l8c-ui-<version>.tgz
```

## Publishing

Publishing goes through the built output, not the workspace root:

```bash
cd shared-components
npm run build
cd dist/l8c-ui
npm publish --access public
```

Bump the `version` in [projects/l8c-ui/package.json](shared-components/projects/l8c-ui/package.json) before publishing — npm rejects re-publishing an existing version.
