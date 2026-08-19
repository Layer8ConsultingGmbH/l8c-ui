import { IconName } from '../icon/icon-registry';

export interface PlatformProduct {
  key: string;
  label: string;
  icon?: IconName;
  desc?: string;
}
