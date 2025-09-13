import type { IconType } from "react-icons";

export type TextInputProps = {
  id: string;
  label?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  isValid?: boolean | null;
  baseColor?: string;
  validColor?: string;
  invalidColor?: string;
  rightIcon?: IconType;
  helperText?: string;
}; 