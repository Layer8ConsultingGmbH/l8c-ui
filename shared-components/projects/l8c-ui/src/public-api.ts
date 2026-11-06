/*
 * Public API Surface of @l8c/ui
 */

export * from './button/button.component';
export type {
  ButtonAction,
  ButtonSize,
  ButtonIconType,
  ButtonTone,
} from './button/button.component';
export * from './card/card.component';
export * from './dropdown/dropdown.component';
export * from './spinner/spinner.component';
export * from './input/input.component';
export * from './number-input/number-input.component';
export * from './checkbox/checkbox.component';
export * from './radio/radio.component';
export type { RadioAppearance } from './radio/radio.component';
export * from './select/select.component';
export type { SelectOption } from './select/select.component';
export * from './carousel/carousel.component';
export * from './carousel/carousel-slide.component';
export * from './search-field/search-field.component';
export * from './table/table.component';
export type { TableColumn, PageableData, CellType, ColumnSort } from './table/table.component';
export * from './pagination/pagination.component';
export * from './navigation-bar/navigation-bar.component';
export * from './side-nav/side-nav.component';
export type { SideNavItem, SideNavSubItem } from './side-nav/side-nav.model';
export type { PageChangeEvent } from './pagination/pagination.component';
export * from './dialog/dialog.component';
export * from './confirm-dialog/confirm-dialog.component';
export * from './icon/icon.component';
export type { IconName } from './icon/icon-registry';
export * from './color-input/color-input.component';
export * from './date-picker/date-picker.component';
export * from './date-picker/format-date.pipe';
export { formatDate, parseIsoDate, toIsoDate } from './date-picker/date-format';
export type { PickerLang } from './date-picker/date-format';
export * from './time-picker/time-picker.component';
export * from './duration-input/duration-input.component';
export {
  DURATION_SEGMENT_MAX,
  parseDuration,
  formatDuration,
  durationToSegments,
  durationFromSegments,
} from './duration-input/duration-format';
export type { DurationParts } from './duration-input/duration-format';
export * from './brand-editor/brand-editor.component';
export type { BrandImageSlot } from './brand-editor/brand-editor.component';
export {
  BRAND_COLOR_TOKENS,
  BRAND_COLOR_GROUPS,
  DERIVED_TINTS,
  FONT_WEIGHT_KEYS,
  LINE_HEIGHT_KEYS,
  RADIUS_KEYS,
  MAX_LOGO_BYTES,
  LOGO_MIME_TYPES,
  FAVICON_MIME_TYPES,
  hexToRgb,
  mergeBrandConfig,
  compactBrandConfig,
  readBrandDefaults,
  applyBrand,
} from './brand/brand.model';
export type {
  BrandColorToken,
  BrandThemeColors,
  BrandTheme,
  FontWeightKey,
  LineHeightKey,
  RadiusKey,
  BrandTypography,
  BrandDesignTokens,
  BrandLogos,
  BrandConfig,
  BrandConfigItem,
} from './brand/brand.model';
export { BRAND_EDITOR_LABELS, mergeBrandEditorLabels } from './brand/brand-labels';
export type { BrandEditorLabels, BrandEditorLabelsInput } from './brand/brand-labels';
export * from './toast/toast.component';
export * from './toast/toast-container.component';
export { L8cToastService, DEFAULT_TOAST_DURATION } from './toast/toast.service';
export type { ToastTone, ToastItem } from './toast/toast.service';
export * from './account-menu/account-menu.component';
export type { AccountMenuOption, AccountMenuButton } from './account-menu/account-menu.component';
export * from './product-switcher/product-switcher.component';
export type { PlatformProduct } from './product-switcher/product-switcher.model';
