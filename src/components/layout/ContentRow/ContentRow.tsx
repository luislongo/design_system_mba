import { type ReactNode } from "react";

type Layout = "desktop" | "mobile";

export interface ContentRowProps {
  layout?: Layout;
  children?: ReactNode;
  className?: string;
}

export function ContentRow({ layout = "desktop", children, className = "" }: ContentRowProps) {
  if (layout === "mobile") {
    return (
      <div
        className={[
          "flex flex-wrap gap-400 content-start overflow-hidden",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={[
        "flex gap-400 h-[140px] overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
