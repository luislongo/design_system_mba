import { type ReactNode } from "react";

type Size = "desktop" | "mobile";

export interface DoubleColumnProps {
  size?: Size;
  slotLeft?: ReactNode;
  slotRight?: ReactNode;
  className?: string;
}

export function DoubleColumn({
  size = "desktop",
  slotLeft,
  slotRight,
  className = "",
}: DoubleColumnProps) {
  if (size === "mobile") {
    return (
      <div
        className={[
          "flex flex-col gap-400 py-250 w-full overflow-hidden",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="flex p-250 w-full">{slotLeft}</div>
        <div className="flex p-250 w-full">{slotRight}</div>
      </div>
    );
  }

  return (
    <div
      className={[
        "grid grid-cols-2 gap-x-400 py-250 overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex p-250">{slotLeft}</div>
      <div className="flex p-250">{slotRight}</div>
    </div>
  );
}
