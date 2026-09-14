export interface ChartSeries {
  key: string;
  name: string;
  color?: string;
}

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export const CHART_COLORS = [
  "#0095ff",
  "#00e096",
  "#a700ff",
  "#ef4444",
  "#3cd856",
  "#ff9f43",
  "#ee5a24",
];

export const CHART_AXIS = {
  fill: "#96a5b8",
  fontSize: 12,
  fontFamily: "DM Sans",
} as const;

export const CHART_GRID = "rgba(70,78,95,0.04)";

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#fff",
  border: "1px solid #e0e4e9",
  borderRadius: 8,
  fontFamily: "DM Sans",
  fontSize: 12,
} as const;
