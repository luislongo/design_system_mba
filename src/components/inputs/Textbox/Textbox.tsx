import { type InputHTMLAttributes } from "react";

export interface TextboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  hasError?: boolean;
}

export function Textbox({ hasError = false, disabled, className = "", ...props }: TextboxProps) {
  return (
    <input
      type="text"
      disabled={disabled}
      className={[
        "w-full h-10 px-400 rounded-200 border outline-none",
        "font-sans text-sm text-neutral-800 bg-light-full",
        "placeholder:text-neutral-400 transition-colors duration-150",
        hasError
          ? "border-danger-500 focus:border-danger-500"
          : "border-neutral-200 hover:border-neutral-300 focus:border-primary-500",
        disabled
          ? "bg-light-800 border-neutral-50 text-neutral-300 placeholder:text-neutral-200 cursor-not-allowed pointer-events-none"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
