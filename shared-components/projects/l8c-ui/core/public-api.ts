/*
 * @l8c/ui/core: Base components of @l8c/ui: form controls, dialogs, feedback, icons and the brand model.
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
export * from './dialog/dialog.component';
export * from './confirm-dialog/confirm-dialog.component';
export type { ConfirmDialogMode } from './confirm-dialog/confirm-dialog.component';
export * from './icon/icon.component';
export type { IconName } from './icon/icon-registry';
export { isIconName } from './icon/icon-registry';
export * from './tooltip/tooltip.directive';
export type { TooltipPlacement } from './tooltip/tooltip.directive';
export * from './status/status.component';
export type { WorkflowStatus } from './status/status.component';
export * from './copy-field/copy-field.component';
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
} from './brand-model/brand.model';
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
} from './brand-model/brand.model';
export * from './toast/toast.component';
export * from './toast/toast-container.component';
export { L8cToastService, DEFAULT_TOAST_DURATION } from './toast/toast.service';
export type { ToastTone, ToastItem } from './toast/toast.service';
