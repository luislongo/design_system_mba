import { type ButtonHTMLAttributes, type ReactNode } from "react";

type IconVariant = "primary" | "secondary" | "tertiary";
type IconSize = "sm" | "md";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconVariant;
  size?: IconSize;
  icon: ReactNode;
}

const variantClasses: Record<IconVariant, string> = {
  primary:
    "bg-primary-500 text-light-full hover:bg-primary-400 focus-visible:ring-primary-500",
  secondary:
    "bg-neutral-50 text-neutral-400 hover:bg-light-800 focus-visible:ring-primary-500",
  tertiary:
    "bg-transparent text-neutral-400 hover:bg-neutral-50 focus-visible:ring-primary-500",
};

const sizeClasses: Record<IconSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
};

export function IconButton({
  variant = "primary",
  size = "md",
  disabled,
  icon,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      aria-label={props["aria-label"]}
      className={[
        "inline-flex items-center justify-center rounded-full shrink-0",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
    >
      <span className="flex items-center justify-center" aria-hidden>
        {icon}
      </span>
    </button>
  );
}
