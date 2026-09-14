import { type ReactNode } from "react";
import { IconAcUnit } from "../../icons";

export type InfoCardColor = "red" | "cyan" | "purple" | "amber" | "lime" | "slate";
export type InfoCardLayout = "desktop" | "mobile";

export interface InfoCardProps {
  color?: InfoCardColor;
  description?: string;
  icon?: ReactNode;
  layout?: InfoCardLayout;
  mainValue?: string;
  subtitles?: string;
  className?: string;
}

const COLOR_MAP: Record<InfoCardColor, { bg: string; iconBg: string }> = {
  red:    { bg: "#ffe2e5", iconBg: "#fa5a7d" },
  cyan:   { bg: "#cff2f7", iconBg: "#14b5d4" },
  purple: { bg: "#f2e8ff", iconBg: "#a854f7" },
  amber:  { bg: "#fff2d1", iconBg: "#f5b824" },
  lime:   { bg: "#e8fad6", iconBg: "#85cc33" },
  slate:  { bg: "#e3e8f0", iconBg: "#63738c" },
};

export function InfoCard({
  color = "red",
  description = "Total Sales",
  icon,
  layout = "desktop",
  mainValue = "$2k",
  subtitles = "+8% from yesterday",
  className = "",
}: InfoCardProps) {
  const { bg, iconBg } = COLOR_MAP[color];
  const isDesktop = layout === "desktop";

  const containerClass = [
    "flex p-300 rounded-400 w-4000",
    isDesktop
      ? "flex-col items-start justify-between h-4000"
      : "flex-row items-center gap-300 h-1600",
    className,
  ].join(" ");

  return (
    <div className={containerClass} style={{ backgroundColor: bg }}>
      <div
        className="flex items-center justify-center p-100 rounded-full shrink-0 text-light-full"
        style={{ backgroundColor: iconBg }}
      >
        {icon ?? <IconAcUnit width={24} height={24} />}
      </div>

      <div
        className={[
          "flex flex-col items-start",
          isDesktop ? "w-full" : "flex-1 min-w-0",
        ].join(" ")}
      >
        <span
          className={[
            "font-sans font-semibold text-card-title w-full",
            isDesktop ? "text-2xl" : "text-lg",
          ].join(" ")}
        >
          {mainValue}
        </span>
        <span
          className={[
            "font-sans text-card-description w-full",
            isDesktop ? "text-base" : "text-sm font-base",
          ].join(" ")}
        >
          {description}
        </span>
        {isDesktop && (
          <span className="font-sans text-xs font-semibold text-card-accent w-full">
            {subtitles}
          </span>
        )}
      </div>
    </div>
  );
}
