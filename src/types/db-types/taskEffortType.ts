export const TASK_EFFORT_TYPE = {
  VERY_QUICK: "Very Quick",
  QUICK: "Quick",
  MODERATE: "Moderate",
  CONSIDERABLE: "Considerable",
  LONG: "Long",
  VERY_LONG: "Very Long",
} as const;

export type TaskEffortType = typeof TASK_EFFORT_TYPE[keyof typeof TASK_EFFORT_TYPE];
