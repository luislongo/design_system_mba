import {
  AreaChart as RechartsAreaChart,
  Area,
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

export interface AreaChartProps {
  data: ChartDataPoint[];
  series: ChartSeries[];
  className?: string;
}

export function AreaChart({ data, series, className = "" }: AreaChartProps) {
  return (
    <div className={["w-full", className].join(" ")}>
      <ResponsiveContainer width="100%" height={258}>
        <RechartsAreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <defs>
            {series.map((s, i) => {
              const color = s.color ?? CHART_COLORS[i % CHART_COLORS.length];
              return (
                <linearGradient key={s.key} id={`area-fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid strokeDasharray="0" stroke={CHART_GRID} vertical={false} />
          <XAxis dataKey="name" tick={CHART_AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={CHART_AXIS} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Legend
            iconType="plainline"
            iconSize={19}
            wrapperStyle={{ fontFamily: "DM Sans", fontSize: 12, color: CHART_AXIS.fill }}
          />
          {series.map((s, i) => {
            const color = s.color ?? CHART_COLORS[i % CHART_COLORS.length];
            return (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={color}
                strokeWidth={2}
                fill={`url(#area-fill-${s.key})`}
                dot={{ r: 4, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            );
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
