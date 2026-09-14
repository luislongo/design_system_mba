export type DataVizColor = "blue" | "green" | "purple" | "orange";

export const dataVizPalette: Record<DataVizColor, { fill: string; track: string; chipBg: string }> = {
  blue:   { fill: "#0095ff", track: "#cde7ff", chipBg: "#f0f9ff" },
  green:  { fill: "#00e096", track: "#8cfac7", chipBg: "#f0fdf4" },
  purple: { fill: "#884dff", track: "#c5a8ff", chipBg: "#fbf1ff" },
  orange: { fill: "#ff8f0d", track: "#ffd5a4", chipBg: "#fef6e6" },
};
