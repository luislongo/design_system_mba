import { dataVizPalette, type DataVizColor } from "../../../tokens";

export type ProgressBarColor = DataVizColor;

export interface ProgressBarProps {
  value: number;
  color?: ProgressBarColor;
  className?: string;
}

export function ProgressBar({ value, color = "blue", className = "" }: ProgressBarProps) {
  const { track, fill } = dataVizPalette[color];
  const width = Math.min(100, Math.max(0, value));

  return (
    <div
      className={["h-100 w-full overflow-hidden rounded-200", className].join(" ")}
      style={{ backgroundColor: track }}
      role="progressbar"
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-200 transition-[width] duration-150"
        style={{ width: `${width}%`, backgroundColor: fill }}
      />
    </div>
  );
}
