import type { Meta, StoryObj } from "@storybook/react";
import { BarChart } from "./BarChart";
import type { ChartDataPoint, ChartSeries } from "../types";

const meta: Meta<typeof BarChart> = {
  title: "Components/Charts/BarChart",
  component: BarChart,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BarChart>;

const data: ChartDataPoint[] = [
  { name: "Monday",    online: 14000, offline: 12000 },
  { name: "Tuesday",   online: 16000, offline: 11000 },
  { name: "Wednesday", online: 6000,  offline: 22000 },
  { name: "Thursday",  online: 15000, offline: 5000  },
  { name: "Friday",    online: 12000, offline: 11000 },
  { name: "Saturday",  online: 15000, offline: 13000 },
  { name: "Sunday",    online: 21000, offline: 10000 },
];

const series: ChartSeries[] = [
  { key: "online",  name: "Online Sales",  color: "#0095ff" },
  { key: "offline", name: "Offline Sales", color: "#00e096" },
];

export const Default: Story = { args: { data, series } };

export const SingleSeries: Story = {
  args: {
    data,
    series: [{ key: "online", name: "Online Sales", color: "#0095ff" }],
  },
};

export const ThreeSeries: Story = {
  args: {
    data: data.map((d) => ({ ...d, instore: Math.round((d.offline as number) * 0.6) })),
    series: [
      { key: "online",  name: "Online" },
      { key: "offline", name: "Offline" },
      { key: "instore", name: "In-store" },
    ],
  },
};
