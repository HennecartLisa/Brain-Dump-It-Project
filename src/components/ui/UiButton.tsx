import '../../App'
import type { ButtonProps } from "../../types/UiButtonProps";

const baseClasses = "px-4 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring";

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-indigo-600 text-stone-50 hover:bg-indigo-500 focus:ring-4 ring-indigo-300",
  secondary: "bg-stone-200 text-stone-800 hover:bg-stone-300 focus:ring-4 ring-stone-400",
  danger: "bg-rose-600 text-stone-50 hover:bg-rose-500 focus:ring-4 ring-rose-300",
};

export default function UiButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
  