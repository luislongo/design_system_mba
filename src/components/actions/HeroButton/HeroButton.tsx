import { type ButtonHTMLAttributes, type ReactNode } from "react";

type HeroVariant = "primary" | "secondary";

export interface HeroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: HeroVariant;
  startIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const variantClasses: Record<HeroVariant, string> = {
  primary:
    "bg-primary-500 text-light-full hover:bg-primary-400 border border-primary-500 hover:border-primary-400 focus-visible:ring-primary-500",
  secondary:
    "bg-transparent text-neutral-400 border border-neutral-200 hover:bg-neutral-50 focus-visible:ring-primary-500",
};

export function HeroButton({
  variant = "primary",
  disabled,
  children,
  startIcon,
  trailingIcon,
  className = "",
  ...props
}: HeroButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-200 font-semibold",
        "h-1600 px-600 text-base gap-200",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {startIcon && <span className="shrink-0 flex items-center">{startIcon}</span>}
      {children}
      {trailingIcon && <span className="shrink-0 flex items-center">{trailingIcon}</span>}
    </button>
  );
}
