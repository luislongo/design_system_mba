import { type ReactNode } from "react";

type Layout = "desktop" | "mobile";

export interface ContentGridProps {
  layout?: Layout;
  children?: ReactNode;
  className?: string;
}

export function ContentGrid({ layout = "desktop", children, className = "" }: ContentGridProps) {
  if (layout === "mobile") {
    return (
      <div
        className={[
          "flex flex-col gap-400 w-full overflow-hidden",
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
