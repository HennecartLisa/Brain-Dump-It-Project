import React from "react";
import type { UiTimePickerProps } from "../../types/UiTimePickerProps";

export default function UiTimePicker({ value, onChange, className = "", min, max, step }: UiTimePickerProps) {
  return (

    <input
      type="time"
      color="light"
      value={value}
      onChange={onChange}
      className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      min={min}
      max={max}
      step={step}
    />
  );
} 