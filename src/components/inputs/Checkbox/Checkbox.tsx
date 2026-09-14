import { forwardRef, type InputHTMLAttributes } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ disabled, className = "", ...props }, ref) => (
    <span className={["relative inline-flex w-5 h-5 shrink-0", className].join(" ")}>
      <input
        ref={ref}
        type="checkbox"
        disabled={disabled}
        className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        {...props}
      />
      <span
        aria-hidden
        className={[
          "absolute inset-0 rounded-100 border border-neutral-200 bg-light-full",
          "flex items-center justify-center pointer-events-none transition-colors duration-150",
          "peer-checked:bg-primary-500 peer-checked:border-primary-500",
          "peer-hover:border-neutral-300",
          "peer-disabled:border-neutral-50 peer-disabled:bg-light-800",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-primary-500",
        ].join(" ")}
      >
        <svg
          className="w-[10px] h-[10px] text-white"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden
        >
          <path
            d="M1.5 5L4 7.5L8.5 2.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  )
);
Checkbox.displayName = "Checkbox";
