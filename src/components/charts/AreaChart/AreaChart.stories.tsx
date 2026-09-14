import type { Meta, StoryObj } from "@storybook/react";
import { AreaChart } from "./AreaChart";
import type { ChartDataPoint, ChartSeries } from "../types";

const meta: Meta<typeof AreaChart> = {
  title: "Components/Charts/AreaChart",
  component: AreaChart,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AreaChart>;

const data: ChartDataPoint[] = [
  { name: "Jan", thisMonth: 360, lastMonth: 160 },
  { name: "Feb", thisMonth: 300, lastMonth: 220 },
  { name: "Mar", thisMonth: 320, lastMonth: 80  },
  { name: "Apr", thisMonth: 260, lastMonth: 80  },
  { name: "May", thisMonth: 340, lastMonth: 130 },
  { name: "Jun", thisMonth: 280, lastMonth: 120 },
  { name: "Jul", thisMonth: 200, lastMonth: 220 },
  { name: "Aug", thisMonth: 210, lastMonth: 220 },
];

const series: ChartSeries[] = [
  { key: "lastMonth",  name: "Last Month",  color: "#0095ff" },
  { key: "thisMonth",  name: "This Month",  color: "#00e096" },
];

export const Default: Story = { args: { data, series } };

export const SingleSeries: Story = {
  args: {
    data,
    series: [{ key: "thisMonth", name: "This Month", color: "#0095ff" }],
  },
};

export const ThreeSeries: Story = {
  args: {
    data: data.map((d) => ({ ...d, target: 250 })),
    series: [
      { key: "lastMonth", name: "Last Month" },
      { key: "thisMonth", name: "This Month" },
      { key: "target",    name: "Target" },
    ],
  },
};
