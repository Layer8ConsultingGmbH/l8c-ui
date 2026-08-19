export interface SideNavItem {
  key: string;
  label: string;
  icon?: string;
  children?: SideNavSubItem[];
}

export interface SideNavSubItem {
  key: string;
  label: string;
}
