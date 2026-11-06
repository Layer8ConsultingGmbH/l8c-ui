export interface SideNavItem {
  key: string;
  label: string;
  icon?: string;
  /**
   * Optional help page (e.g. the matching user guide chapter), opened in a
   * new tab by a help link next to the item; expanded rail only
   */
  helpLink?: string;
  children?: SideNavSubItem[];
}

export interface SideNavSubItem {
  key: string;
  label: string;
  /** Optional help page, opened in a new tab by a help link next to the sub-item */
  helpLink?: string;
}
