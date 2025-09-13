import { TextInput, Label } from "flowbite-react";
import type { IconType } from "react-icons";
import type { TextInputProps } from "../../types/UiTextInputProps";

export default function UiTextInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  isValid = null,
  baseColor = "gray",
  validColor = "green",
  invalidColor = "red",
  rightIcon,
  helperText,
}: TextInputProps) {
  let color = baseColor;
  if (isValid === true) color = validColor;
  if (isValid === false) color = invalidColor;

  return (
    <div className="flex flex-col gap-1 relative">
      {label && <Label htmlFor={id}>{label}</Label>}
      <TextInput
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        color={color}
        required={required}
        icon={rightIcon}
        className={rightIcon ? "pr-10" : ""}
      />
      {helperText && (
        <p className={`text-sm ${color === invalidColor ? "text-red-600" : color === validColor ? "text-green-600" : "text-gray-500"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}