import { Checkbox, Label } from "flowbite-react";
import type { UiCheckboxProps } from "../../types/UiCheckboxProps";

export default function UiCheckbox ({
    id, 
    lable,
    disabled = false,
    checked = false
    }: UiCheckboxProps) {
    return (
        <div className="flex items-center gap-2">
        <Checkbox id={id}></Checkbox>
        <Label htmlFor={id}>{lable} </Label>
      </div>
    );
}