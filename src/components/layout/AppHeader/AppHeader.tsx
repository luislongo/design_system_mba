import { type ReactNode } from "react";
import { H1 } from "../../typography/Typography";

type Size = "desktop" | "mobile";

export interface AppHeaderLeftProps {
  icon?: ReactNode;
  title?: string;
  size?: Size;
  className?: string;
}

export function AppHeaderLeft({ icon, title = "", size = "desktop", className = "" }: AppHeaderLeftProps) {
  return (
    <div
      className={[
        "flex items-center overflow-hidden",
        size === "desktop" && "gap-250",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon}
      {size === "desktop" && <H1>{title}</H1>}
    </div>
  );
}

export interface AppHeaderRightProps {
  avatar?: ReactNode;
  size?: Size;
  className?: string;
}

export function AppHeaderRight({ avatar, size = "desktop", className = "" }: AppHeaderRightProps) {
  return (
    <div
      className={[
        "flex items-center justify-center shrink-0",
        size === "desktop" ? "size-1200" : "size-[36px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {avatar}
    </div>
  );
}

export interface AppHeaderProps {
  size?: Size;
  title?: string;
  icon?: ReactNode;
  avatar?: ReactNode;
  navbar?: ReactNode;
  className?: string;
}

export function AppHeader({
  size = "desktop",
  title = "",
  icon,
  avatar,
  navbar,
  className = "",
}: AppHeaderProps) {
  return (
    <div
      className={[
        "flex items-center justify-between px-400 bg-light-full w-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <AppHeaderLeft icon={icon} title={title} size={size} />
      {navbar}
      <AppHeaderRight avatar={avatar} size={size} />
    </div>
  );
}
