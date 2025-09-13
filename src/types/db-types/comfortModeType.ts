import type { ThemeType } from './themeType';

export type ComfortModeType = {
  id: number;
  profileId: string;
  themeId: number;
  typography1?: string;
  typography2?: string;
  scaling: number;
  createdAt: Date;
  updatedAt: Date;
  theme?: ThemeType;
};
