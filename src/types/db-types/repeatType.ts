import { PERIODS_TYPE } from './periodsType.ts';

export type RepeatType = {
  id: number;
  label: string;
  periods?: typeof PERIODS_TYPE[keyof typeof PERIODS_TYPE];
  intervalValue: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  isBuiltin: boolean;
  createdAt: Date;
};
