# Changelog

All notable changes to `@l8c/ui` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `l8c-icon`: new icons from Design System v0.5.1: `upload`, `save`, `server`, `ban`, `map-pin` and `circle-question-mark` with its alias `circle-help` (the older Lucide name, used by the side-nav help link).

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
