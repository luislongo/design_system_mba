import {
  LineChart as RechartsLineChart,
  Line,
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

export interface LineChartProps {
  data: ChartDataPoint[];
  series: ChartSeries[];
  className?: string;
}

export function LineChart({ data, series, className = "" }: LineChartProps) {
  return (
    <div className={["w-full", className].join(" ")}>
      <ResponsiveContainer width="100%" height={238}>
        <RechartsLineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
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
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
