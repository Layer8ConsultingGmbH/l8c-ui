# @l8c/ui

Standalone Angular UI components by [Layer8 Consulting](https://l8c.io). Signal-based, tree-shakeable and themeable through CSS custom properties.

## Installation

```bash
npm install @l8c/ui
```

Peer dependencies: `@angular/common` and `@angular/core` `^22.0.0`.

## Usage

```ts
import { Component } from '@angular/core';
import { ButtonComponent } from '@l8c/ui';

@Component({
  selector: 'app-save-bar',
  imports: [ButtonComponent],
  template: `<l8c-button action="primary" (clicked)="save()">Save</l8c-button>`,
})
export class SaveBarComponent {
  save() {}
}
```

## Components

`l8c-button`, `l8c-card`, `l8c-input`, `l8c-number-input`, `l8c-checkbox`, `l8c-radio`, `l8c-select`, `l8c-dropdown`, `l8c-search-field`, `l8c-table`, `l8c-pagination`, `l8c-carousel`, `l8c-dialog`, `l8c-confirm-dialog`, `l8c-navigation-bar`, `l8c-side-nav`, `l8c-account-menu`, `l8c-product-switcher`, `l8c-icon`, `l8c-spinner`

## Theming

Components read CSS custom properties such as `--primary`, `--surface`, `--text`, `--border`, `--font-family` and `--radius-md`, each with a built-in fallback. Define them on `:root` in your global stylesheet to apply your own design tokens.

## Documentation

Full documentation, the token reference and the development guide live in the [GitHub repository](https://github.com/Layer8ConsultingGmbH/l8c-ui).

## License

[MIT](https://github.com/Layer8ConsultingGmbH/l8c-ui/blob/main/LICENSE) © 2026 Layer8 Consulting GmbH
