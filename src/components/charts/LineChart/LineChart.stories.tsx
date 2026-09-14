import type { Meta, StoryObj } from "@storybook/react";
import { LineChart } from "./LineChart";
import type { ChartDataPoint, ChartSeries } from "../types";

const meta: Meta<typeof LineChart> = {
  title: "Components/Charts/LineChart",
  component: LineChart,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LineChart>;

const data: ChartDataPoint[] = [
  { name: "Jan",  loyal: 330, new: 260, unique: 340 },
  { name: "Feb",  loyal: 300, new: 250, unique: 300 },
  { name: "Mar",  loyal: 320, new: 220, unique: 320 },
  { name: "Apr",  loyal: 250, new: 200, unique: 240 },
  { name: "May",  loyal: 210, new: 215, unique: 215 },
  { name: "Jun",  loyal: 220, new: 260, unique: 260 },
  { name: "Jul",  loyal: 260, new: 310, unique: 330 },
  { name: "Sept", loyal: 310, new: 310, unique: 310 },
  { name: "Oct",  loyal: 270, new: 280, unique: 200 },
  { name: "Nov",  loyal: 130, new: 110, unique: 150 },
  { name: "Dec",  loyal: 150, new: 90,  unique: 230 },
];

const series: ChartSeries[] = [
  { key: "loyal",  name: "Loyal Customers",  color: "#a700ff" },
  { key: "new",    name: "New Customers",    color: "#ef4444" },
  { key: "unique", name: "Unique Customers", color: "#3cd856" },
];

export const Default: Story = { args: { data, series } };

export const TwoSeries: Story = {
  args: {
    data,
    series: [
      { key: "loyal", name: "Loyal Customers", color: "#a700ff" },
      { key: "new",   name: "New Customers",   color: "#ef4444" },
    ],
  },
};
