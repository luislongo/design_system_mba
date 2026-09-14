import { type ReactNode } from "react";

type ActiveSide = "left" | "right";
type ToggleSize = "default" | "large";

export interface IconToggleProps {
  leftIcon: ReactNode;
  rightIcon: ReactNode;
  active?: ActiveSide;
  size?: ToggleSize;
  disabled?: boolean;
  onLeftClick?: () => void;
  onRightClick?: () => void;
  className?: string;
}

const slotSize: Record<ToggleSize, string> = {
  default: "w-8 h-8",
  large: "w-10 h-10",
};

const iconSize: Record<ToggleSize, string> = {
  default: "w-4 h-4",
  large: "w-5 h-5",
};

export function IconToggle({
  leftIcon,
  rightIcon,
  active = "left",
  size = "default",
  disabled = false,
  onLeftClick,
  onRightClick,
  className = "",
}: IconToggleProps) {
  const slot = slotSize[size];
  const icon = iconSize[size];

  const slotClass = (side: ActiveSide) => {
    const isActive = active === side;
    return [
      slot,
      "flex items-center justify-center rounded-full transition-colors duration-150",
      disabled
        ? isActive
          ? "bg-neutral-200"
          : "bg-transparent"
        : isActive
        ? "bg-primary-500 hover:bg-primary-400 cursor-pointer"
        : "bg-transparent hover:bg-light-800 cursor-pointer",
    ].join(" ");
  };

  const iconClass = (side: ActiveSide) =>
    [
      icon,
      "flex items-center justify-center",
      disabled
        ? "text-neutral-300"
        : active === side
        ? "text-white"
        : "text-neutral-400",
    ].join(" ");

  return (
    <div
      className={[
        "inline-flex items-center p-050 rounded-full",
        disabled ? "bg-light-800 opacity-60" : "bg-neutral-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onLeftClick}
        aria-pressed={active === "left"}
        className={slotClass("left")}
      >
        <span className={iconClass("left")}>{leftIcon}</span>
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onRightClick}
        aria-pressed={active === "right"}
        className={slotClass("right")}
      >
        <span className={iconClass("right")}>{rightIcon}</span>
      </button>
    </div>
  );
}
