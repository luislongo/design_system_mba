import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Size = "desktop" | "mobile";

const containerSize: Record<Size, string> = {
  desktop: "h-16 px-600",
  mobile: "h-11 px-400",
};

const iconSize: Record<Size, string> = {
  desktop: "w-6 h-6",
  mobile: "w-6 h-6",
};

export interface NavbarTabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
  active?: boolean;
  size?: Size;
}

export function NavbarTab({
  label,
  icon,
  active = false,
  size = "desktop",
  disabled,
  onClick,
  className = "",
  ...props
}: NavbarTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={onClick}
      className={[
        "relative flex flex-col items-center justify-center gap-100",
        containerSize[size],
        "bg-light-full font-sans transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500",
        "disabled:pointer-events-none",
        disabled
          ? "text-neutral-400 cursor-not-allowed"
          : active
          ? "text-neutral-800 cursor-pointer"
          : "text-neutral-800 hover:bg-neutral-500 hover:text-light-full cursor-pointer",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <span className={[iconSize[size], "flex items-center justify-center shrink-0"].join(" ")} aria-hidden>
        {icon}
      </span>
      {size === "desktop" && <span className="text-xs leading-none">{label}</span>}
      <span
        aria-hidden
        className={[
          "absolute bottom-0 left-0 right-0 h-[2px]",
          active
            ? disabled
              ? "bg-neutral-200"
              : "bg-primary-500"
            : "bg-transparent",
        ].join(" ")}
      />
    </button>
  );
}
