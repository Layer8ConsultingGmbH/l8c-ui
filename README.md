# l8c-ui

A small, standalone Angular UI component library by [Layer8 Consulting](https://l8c.io). It powers our own products and is published to npm as [`@l8c/ui`](https://www.npmjs.com/package/@l8c/ui).

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
| `l8c-toast` / `l8c-toast-container` | Short feedback after an action (info, success, error), fed by `L8cToastService` |
| `l8c-color-input` | Color field: swatch with the system picker plus a text field for any CSS color |
| `l8c-date-picker` | Date field with a calendar popover, value ISO `YYYY-MM-DD`, shown as `07 Mar 2026` |
| `l8c-time-picker` | 24-hour time entry `HH:MM` with a list of times |
| `l8c-duration-input` | Duration as four segments D · H · M · S, value `DD:HH:MM:SS` |
| `l8c-file-input` | File selection as a drop zone with a file list, or as a plain button |
| `l8c-copy-field` | Read-only value with a copy button; announces the copy |
| `l8c-status` | Workflow / row status chip with a tone dot; known statuses map to a color |
| `l8cTooltip` | Directive: text hint on hover and keyboard focus, replaces native `title` attributes |

### Tooltips

`[l8cTooltip]="'Edit questionnaire'"` on any element shows the text after `tooltipDelay` (300 ms) on hover or focus and hides on leave, blur or Escape. `tooltipPlacement` is `top` (default), `bottom`, `left` or `right`; there is no automatic flipping, but the tooltip stays inside the viewport. It is rendered into `<body>` with a fixed position, so tables and dialogs never clip it, and it adds `aria-describedby` to the element while it shows: keep the element's own accessible name (`ariaLabel`), the tooltip only describes. Text only, at most a short sentence.

### File input, copy field and status

- `l8c-file-input`: `variant="dropzone"` (default) is a dashed area with the `upload` icon, `dropLabel`, a secondary mini `buttonLabel` and the `files` listed below with size and a remove button; `variant="button"` is just a button (`buttonAction`, `buttonIcon`) that opens the file dialog. `(filesChange)` gets `File[]` (one unless `multiple`); `accept` only filters the dialog, so validate type and size in the host and show the result through `error`. The native input stays hidden in the DOM.
- `l8c-copy-field`: a read-only value (ID, link, token) styled like a disabled input with a copy button at its right end. Only the button copies and is a tab stop; after copying the icon shows a check for 2 s and `copiedMessage` is announced through a live region. `(copiedValue)` reports the copy.
- `l8c-status`: workflow statuses Draft, Ready, Open, In Progress, Completed, Done and Archived use the `--status-<name>` and `--status-<name>-bg` tokens with `--status-border`; other known statuses (Scheduled, Sent, Approved, Pending, Overdue, …) map to a tone; `tone` overrides. The element carries `data-status` or `data-tone`. Every token has a fallback, so the chip works without the status tokens.

### Date, time and duration

- `l8c-date-picker` replaces the browser's native `type="date"`: the field is a button that opens a calendar (weeks start on Monday, arrows move by day and week, PageUp/PageDown by month, Enter picks, Escape closes). `min` / `max` are ISO dates and also appear as attributes on the field, `lang` (`en`, `de`) picks the month names, `todayLabel`, `clearLabel`, `openLabel`, `prevLabel`, `nextLabel` are the translated texts. Works with `[(value)]` and as a form control. `formatDate(iso, lang)` and the `l8cFormatDate` pipe render the platform notation.
- `l8c-time-picker`: two typed segments (hours stop at 23, minutes at 59, `:` and the arrows jump) plus a clock button that lists every `step` minutes (default 30). Emits `HH:MM`, or `""` while both segments are empty.
- `l8c-duration-input`: four segments that fill from the left and hand over on their own; days up to 365. Emits `DD:HH:MM:SS` with empty segments as zero, `""` while nothing is filled; `readOnly` renders the value as text; `legacyHint` shows a stored value that is no duration. `parseDuration`, `formatDuration`, `durationToSegments` and `durationFromSegments` are exported.
| `l8c-brand-editor` | Organization branding: configurations, logos, theme colors, typography and design tokens; host-controlled |

### Brand editor

`l8c-brand-editor` edits a `BrandConfig` (name, description, logos and favicon, 19 color tokens per theme, typography, design tokens). **The host owns the data**: the editor keeps only the draft and reports intents, the host loads and stores and then passes the new `configs` / `config` back in.

```ts
<l8c-brand-editor
  [configs]="items"                 // BrandConfigItem[]: { id, name, isCurrent }
  [selectedId]="selectedId"
  [config]="storedConfigOfSelection"
  [defaults]="defaults"             // readBrandDefaults(): the stylesheet values in use
  [activeTheme]="theme"
  [saving]="busy"
  [labels]="translate.instant('brandEditor')"
  [cancelLabel]="'Cancel'" [deleteLabel]="'Delete'"
  (selected)="open($event)"         // after the discard check; null = nothing selected
  (created)="create($event)"        // with the default name
  (saved)="save($event)"            // the compact draft (only filled values)
  (activated)="activate($event)"
  (deleted)="remove($event)"        // after the delete confirmation
  (preview)="applyBrand($event, theme)"  // every change; null while nothing is selected
/>
```

- Switching or creating while the draft is dirty asks first; delete always asks, with a stronger message for the active configuration. "Unsaved changes" badge; Save needs a selection, a change and a name; Activate only for a saved, inactive configuration. `draft` resumes an unsaved draft after navigating back.
- Helpers: `applyBrand(config, theme, root?)` writes the config as CSS custom properties (status colors bring their pill tint and border, `primary` sets `--primary-rgb`, radius `lg` sets `--surface-radius`; `null` removes them), `readBrandDefaults()` reads the stylesheet values of both themes, `mergeBrandConfig()` and `compactBrandConfig()` combine and trim configs.
- Logos PNG, JPEG, WebP or SVG, favicon PNG, SVG or ICO, each up to 200 KB, stored as data URLs.
- `labels` takes the l8c-survey `brandEditor` translation object as it is (English defaults built in, see `BRAND_EDITOR_LABELS`); `{{name}}` is replaced with the configuration name.

### Toasts

`L8cToastService` (provided in root) holds the toasts; `l8c-toast-container` renders them fixed top right below the top navigation, oldest first. Place the container once in the app shell, outside any layout switch, so toasts show on every page and survive navigation.

```ts
import { L8cToastContainerComponent, L8cToastService } from '@l8c/ui';

@Component({
  selector: 'app-root',
  imports: [L8cToastContainerComponent],
  template: `
    <router-outlet />
    <l8c-toast-container [dismissLabel]="'Close'" />
  `,
})
export class App {}

@Component({ /* … */ })
export class SaveBarComponent {
  private toasts = inject(L8cToastService);
  save() {
    this.toasts.success('Draft saved.');
  }
}
```

- `info(message, duration?)` and `success(message, duration?)` close after `DEFAULT_TOAST_DURATION` (2600 ms); `setDuration(ms)` changes the default for the app, e.g. from its runtime configuration.
- `error(message)` stays until the user dismisses it, so it cannot vanish unread; only error toasts have a dismiss button, whose accessible name and tooltip is the container's `dismissLabel`.
- `role="status"` for info and success, `role="alert"` for errors. Toasts let clicks through to the page; only the dismiss button takes them.
- Messages are finished strings: pass translated values from the host app.

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

Releases use npm [staged publishing](https://docs.npmjs.com/staged-publishing/) with [trusted publishing](https://docs.npmjs.com/trusted-publishers/) (OIDC, no tokens). Merging a commit into `main` that bumps `version` in [projects/l8c-ui/package.json](shared-components/projects/l8c-ui/package.json) triggers the [publish workflow](.github/workflows/cd-publish-npm.yml), which builds and tests the library, uploads it to npm's staging queue with a provenance attestation, tags the commit (`vX.Y.Z`) and creates a GitHub release with the matching [CHANGELOG.md](CHANGELOG.md) section as notes. Merges that leave the version unchanged do nothing.

The staged version is **not installable** until a maintainer approves it with two-factor authentication. This keeps a compromised CI run or GitHub account from shipping a release on its own.

To release:

1. Bump `version` in `projects/l8c-ui/package.json` following [Semantic Versioning](https://semver.org/).
2. Move the **Unreleased** entries in `CHANGELOG.md` under the new version and date.
3. Open a pull request and merge it into `main`.
4. Approve the staged version on [npmjs.com](https://www.npmjs.com/package/@l8c/ui) or from a terminal:

   ```bash
   npm stage list @l8c/ui
   npm stage approve <stage-id>
   ```

   Optional integrity check before approving: `npm stage download <stage-id>`, build the tagged commit locally with `npm run publish:local` and diff the two tarballs.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and coding conventions, and note that this project follows a [Code of Conduct](CODE_OF_CONDUCT.md).

Found a security issue? Please follow the process in [SECURITY.md](SECURITY.md) instead of opening a public issue.

## License

[MIT](LICENSE) © 2026 Layer8 Consulting GmbH
