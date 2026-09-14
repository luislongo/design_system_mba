import { type ReactNode } from "react";

type TabListSize = "Default" | "Large";

export interface TabListProps {
  children: ReactNode;
  size?: TabListSize;
  className?: string;
}

const sizeMap: Record<TabListSize, string> = {
  Default: "py-250 gap-250",
  Large:   "py-300 gap-600",
};

export function TabList({ children, size = "Default", className = "" }: TabListProps) {
  return (
    <div
      role="tablist"
      className={[
        "flex items-end",
        sizeMap[size],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
