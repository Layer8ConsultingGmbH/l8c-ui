# Changelog

All notable changes to `@l8c/ui` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `l8c-toast`, `l8c-toast-container` and `L8cToastService` (Design System v0.5.1 Toast, ported from l8c-survey): info, success and error toasts top right below the top navigation; info and success close after `DEFAULT_TOAST_DURATION` (2600 ms, changeable via `setDuration()` or per call), error toasts stay until dismissed and are the only ones with a dismiss button (`dismissLabel` on the container). `role="status"` / `role="alert"`, clicks pass through to the page, no motion with `prefers-reduced-motion`.
- `l8cTooltip` directive (Design System v0.5.1 Tooltip): hover and focus hint instead of native `title`, `tooltipPlacement`, `tooltipDelay`, rendered into `<body>` with a fixed position, `aria-describedby` while shown, hides on leave, blur and Escape.
- `l8c-file-input` (Design System v0.5.1 FileInput): drop zone with file list or a plain button that opens the file dialog; `filesChange` with `File[]`, `accept`, `multiple`, `buttonAction`, `buttonIcon`, translated texts as inputs. The brand editor's logo buttons use it.
- `l8c-copy-field` (Design System v0.5.1 CopyField, ported from l8c-survey): read-only value with a copy button, check mark and live-region announcement for 2 s after copying, `copiedValue` output.
- `l8c-status` (Design System v0.5.1 StatusBadge, ported from l8c-survey `app-status-badge`): workflow statuses on the `--status-*` tokens with `--status-border`, other known statuses on the pill tones, `tone` override, `data-status` / `data-tone` attributes; all tokens with fallbacks.
- `l8c-date-picker` (Design System v0.5.1 DatePicker): calendar popover instead of the native `type="date"`, ISO value, platform notation `07 Mar 2026` / `07 Mär 2026` via `lang`, `min` / `max`, keyboard navigation, Today and Clear in the footer, translated labels as inputs; `ControlValueAccessor` and `[(value)]`. With `formatDate`, `parseIsoDate`, `toIsoDate` and the `l8cFormatDate` pipe.
- `l8c-time-picker` (Design System v0.5.1 TimePicker): `HH:MM` as two typed segments plus a list of times every `step` minutes; lines up with the date picker.
- `l8c-duration-input` (Design System v0.5.1 DurationInput, ported from l8c-survey): D · H · M · S segments, `DD:HH:MM:SS`, legacy `HH:MM:SS` read, read-only rendering, `legacyHint` for stored values that are no duration. With `parseDuration`, `formatDuration`, `durationToSegments`, `durationFromSegments`.
- `l8c-color-input` (Design System v0.5.1 ColorInput): a swatch on a checkerboard that opens the system color picker plus a text field for any CSS color; `invalidMessage` while the browser cannot read the value; `ControlValueAccessor`.
- `l8c-brand-editor` (Design System v0.5.1 BrandEditor, ported from l8c-survey): configurations (select, new, activate, delete with confirmation), name and description, logos and favicon (200 KB, type check), 19 color tokens per theme via `l8c-color-input`, typography and design tokens. Host-controlled: `selected`, `created`, `saved`, `activated`, `deleted` and `preview` outputs; `labels` takes the Survey `brandEditor` translation object. With the brand model (`BrandConfig`, `BrandConfigItem`, token lists) and the helpers `applyBrand`, `readBrandDefaults`, `mergeBrandConfig`, `compactBrandConfig`, `hexToRgb`.
- `l8c-icon`: new icons from Design System v0.5.1: `upload`, `save`, `server`, `ban`, `map-pin` and `circle-question-mark` with its alias `circle-help` (the older Lucide name, used by the side-nav help link).

### Changed

- `l8c-side-nav`: items and sub-items take an optional `helpLink` (e.g. the matching user guide chapter); a `circle-help` link next to the entry opens it in a new tab, named `<helpLabel>: <item label>` (new `helpLabel` input, default "Open user guide"). Shown on the expanded rail only. The `footerTemplate` now renders on the collapsed rail as well and gets the collapsed state as its implicit context (`let-collapsed`), so an app can show its footer entry as an icon there. **Breaking for footers that ignore the state:** they now also show on the collapsed rail.
- `l8c-dialog`: the width comes from the new `width` input (px number or CSS length) or the custom property `--dialog-width` on any ancestor (default 520px), never wider than the viewport; apps no longer need `::ng-deep` overrides. The open dialog is a flex column capped at 90vh in which only the content scrolls (no more fixed `calc(90vh - 120px)` content height), and `contentLayout="flex"` turns the content area into a non-scrolling flex column for content that pins its own footer. The content keeps an 8px inner gutter so focus rings and hover glows at its edge are no longer clipped.

### Fixed

- `l8c-icon`: `file-output` now uses the current Lucide path data (the previous glyph was a broken mix of two revisions).

### Security

- Resolved all 11 advisories reported by `npm audit` (2 critical, 6 high, 3 moderate) by updating the build and test toolchain: Angular packages `22.1.1`/`22.1.3` to `22.2.3`/`22.2.5`, `ng-packagr` to `^22.2.5`, and `vitest` and `@vitest/coverage-v8` to `^4.1.12`. This covers the `@angular/router` SSR denial-of-service issues, the `piscina` prototype-pollution RCE, the `vite`/`launch-editor` command-execution and path-disclosure issues, `@modelcontextprotocol/sdk` and `zod` (via `@angular/cli`), `@hono/node-server` and `@vitest/mocker`. The published peer dependency ranges are unchanged, so consumers are not affected.

## [1.1.0] - 2026-09-14

### Added

- `l8c-table`: text cells can render their value as a toned pill via the new `TableColumn.valueTone` callback (Design System Badge without status dot).
- `l8c-table`: `CellBadge` accepts an optional `tone` (defaults to `neutral`).
- `l8c-table`: status `scheduled` maps to the `primary` tone.
- `l8c-navigation-bar`: numbered items are shown as a window around the active item, limited by the new `maxVisibleItems` input (default `10`); hidden ranges are reachable via clickable `…` buttons that page the window.
- `l8c-navigation-bar`: new `showCount` input (default `true`) renders `active / total` next to the numbers.
- `l8c-navigation-bar`: custom actions can be projected into the top row next to the done button via `<ng-content select="[navActions]">`.
- `l8c-icon`: new `grip-vertical` icon for drag-and-drop handles.

### Changed

- `l8c-table`: cell badges are now rendered after the cell value instead of before it, and all pills (`cell-badge`, `value-badge`, `status-badge`) share one `.badge` base style with semantic tones.
- `l8c-icon`: removed unused SVG asset files from `src/icon/assets`; icons are inlined in the component, so the available `IconName` values are unchanged.

## [1.0.2] - 2026-09-08

### Changed

- Project published as open source under the MIT license; added README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY and this changelog.
- npm package now ships LICENSE, a consumer-facing README and full package metadata (`license`, `homepage`, `bugs`, `keywords`).

## [1.0.1] - 2026-08-19

### Fixed

- Peer dependency ranges for `@angular/common` and `@angular/core` (`^22.0.0`).

## [1.0.0] - 2026-08-19 [DEPRECATED]

Deprecated on npm in favour of 1.0.1 because of incorrect peer dependency ranges.

### Added

- Initial public release with standalone components: button, card, input, number-input, checkbox, radio, select, dropdown, search-field, table, pagination, carousel, dialog, confirm-dialog, navigation-bar, side-nav, account-menu, product-switcher, icon and spinner.

[Unreleased]: https://github.com/Layer8ConsultingGmbH/l8c-ui/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/Layer8ConsultingGmbH/l8c-ui/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/Layer8ConsultingGmbH/l8c-ui/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/Layer8ConsultingGmbH/l8c-ui/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Layer8ConsultingGmbH/l8c-ui/releases/tag/v1.0.0
