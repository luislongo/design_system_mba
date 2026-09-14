import { forwardRef, type InputHTMLAttributes } from "react";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ disabled, className = "", ...props }, ref) => (
    <span className={["relative inline-flex w-5 h-5 shrink-0", className].join(" ")}>
      <input
        ref={ref}
        type="radio"
        disabled={disabled}
        className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        {...props}
      />
      <span
        aria-hidden
        className={[
          "absolute inset-0 rounded-full border-2 border-neutral-200 bg-light-full",
          "flex items-center justify-center pointer-events-none transition-colors duration-150",
          "peer-checked:border-primary-500 peer-checked:bg-primary-500",
          "peer-hover:border-neutral-300",
          "peer-disabled:border-neutral-50 peer-disabled:bg-light-800",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-primary-500",
        ].join(" ")}
      >
        <span className="w-2 h-2 rounded-full bg-white" />
      </span>
    </span>
  )
);
Radio.displayName = "Radio";
