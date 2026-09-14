import { type ButtonHTMLAttributes, type ReactNode } from "react";

type DangerVariant = "primary" | "secondary" | "tertiary";
type DangerSize = "sm" | "md";

export interface DangerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: DangerVariant;
  size?: DangerSize;
  startIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const variantClasses: Record<DangerVariant, string> = {
  primary:
    "bg-danger-500 text-light-full hover:bg-danger-400 border border-danger-500 hover:border-danger-400 focus-visible:ring-danger-500",
  secondary:
    "bg-transparent text-danger-500 border border-danger-500 hover:bg-danger-50 hover:border-danger-400 focus-visible:ring-danger-500",
  tertiary:
    "bg-transparent text-danger-500 border border-transparent hover:bg-danger-50 focus-visible:ring-danger-500",
};

const sizeClasses: Record<DangerSize, string> = {
  sm: "h-8 px-300 text-sm gap-100",
  md: "h-12 px-400 text-sm gap-200",
};

export function DangerButton({
  variant = "primary",
  size = "md",
  disabled,
  children,
  startIcon,
  trailingIcon,
  className = "",
  ...props
}: DangerButtonProps) {
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
