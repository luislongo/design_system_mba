import { type ReactNode } from "react";
import { H1 } from "../../typography/Typography";

type Size = "desktop" | "mobile";

export interface AppHeaderLeftProps {
  icon?: ReactNode;
  title?: string;
  className?: string;
}

export function AppHeaderLeft({ icon, title = "", className = "" }: AppHeaderLeftProps) {
  return (
    <div
      className={["flex items-center gap-250 overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
    >
      {icon}
      <H1>{title}</H1>
    </div>
  );
}

export interface AppHeaderRightProps {
  avatar?: ReactNode;
  className?: string;
}

export function AppHeaderRight({ avatar, className = "" }: AppHeaderRightProps) {
  return (
    <div
      className={["flex items-center justify-end shrink-0", className]
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
        size === "mobile" && "py-100",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <AppHeaderLeft icon={icon} title={title} />
      {navbar}
      <AppHeaderRight avatar={avatar} />
    </div>
  );
}
