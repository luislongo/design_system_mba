import { dataVizPalette, type DataVizColor } from "../../../tokens";

export type ProgressChipColor = DataVizColor;

export interface ProgressChipProps {
  value: string;
  color?: ProgressChipColor;
  className?: string;
}

export function ProgressChip({ value, color = "blue", className = "" }: ProgressChipProps) {
  const { fill, chipBg } = dataVizPalette[color];

  return (
    <span
      className={["inline-flex items-center justify-center px-300 py-100 rounded-200 font-sans text-sm font-semibold whitespace-nowrap", className].join(" ")}
      style={{ backgroundColor: chipBg, color: fill }}
    >
      {value}
    </span>
  );
}
