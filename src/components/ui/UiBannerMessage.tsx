import { Alert } from "flowbite-react";
import type { BannerMessageProps } from "../../types/UiBannerMessageProps";

export default function UiBannerMessage({ message, color = "info", onClose }: BannerMessageProps) {
  return (
    <Alert color={color} onDismiss={onClose} className="mb-4">
      {message}
    </Alert>
  );
}