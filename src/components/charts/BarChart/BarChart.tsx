import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  CHART_AXIS,
  CHART_COLORS,
  CHART_GRID,
  CHART_TOOLTIP_STYLE,
  type ChartDataPoint,
  type ChartSeries,
} from "../types";

export type { ChartDataPoint, ChartSeries };

export interface BarChartProps {
  data: ChartDataPoint[];
  series: ChartSeries[];
  className?: string;
}

export function BarChart({ data, series, className = "" }: BarChartProps) {
  return (
    <div className={["w-full", className].join(" ")}>
      <ResponsiveContainer width="100%" height={240}>
        <RechartsBarChart
          data={data}
          margin={{ top: 4, right: 4, left: 0, bottom: 4 }}
          barCategoryGap="30%"
          barGap={2}
        >
          <CartesianGrid strokeDasharray="0" stroke={CHART_GRID} vertical={false} />
          <XAxis dataKey="name" tick={CHART_AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={CHART_AXIS} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Legend
            iconType="square"
            iconSize={12}
            wrapperStyle={{ fontFamily: "DM Sans", fontSize: 12, color: CHART_AXIS.fill }}
          />
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
