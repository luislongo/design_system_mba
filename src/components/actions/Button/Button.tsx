import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "tertiary";
type Size = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  startIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary-500 text-light-full hover:bg-primary-400 border border-primary-500 hover:border-primary-400 focus-visible:ring-primary-500",
  secondary:
    "bg-transparent text-neutral-400 border border-neutral-200 hover:bg-neutral-50 focus-visible:ring-primary-500",
  tertiary:
    "bg-transparent text-neutral-400 border border-transparent hover:bg-neutral-50 focus-visible:ring-primary-500",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-300 text-sm gap-100",
  md: "h-12 px-400 text-sm gap-200",
};

export function Button({
  variant = "primary",
  size = "md",
  disabled,
  children,
  startIcon,
  trailingIcon,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-200 font-semibold",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
    >
      {startIcon && <span className="shrink-0 flex items-center">{startIcon}</span>}
      {children}
      {trailingIcon && <span className="shrink-0 flex items-center">{trailingIcon}</span>}
    </button>
  );
}
