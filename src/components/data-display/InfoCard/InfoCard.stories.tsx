import type { Meta, StoryObj } from "@storybook/react";
import { ICON_OPTIONS } from "../../../stories/icon-options";
import { iconArgType } from "../../../stories/icon-options";
import { InfoCard } from "./InfoCard";

const meta: Meta<typeof InfoCard> = {
  title: "Components/Data Display/InfoCard",
  component: InfoCard,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: ["red", "cyan", "purple", "amber", "lime", "slate"],
    },
    layout: {
      control: "select",
      options: ["desktop", "mobile"],
    },
    description: { control: "text" },
    mainValue: { control: "text" },
    subtitles: { control: "text" },
    icon: iconArgType,
  },
  args: {
    description: "Total Sales",
    mainValue: "$3.6k",
    subtitles: "+8% from yesterday",
  },
};

export default meta;
type Story = StoryObj<typeof InfoCard>;

export const Red: Story = { args: { color: "red" } };
export const Cyan: Story = { args: { color: "cyan" } };
export const Purple: Story = { args: { color: "purple" } };
export const Amber: Story = { args: { color: "amber" } };
export const Lime: Story = { args: { color: "lime" } };
export const Slate: Story = { args: { color: "slate" } };

export const Mobile: Story = {
  args: { color: "cyan", layout: "mobile", subtitles: undefined },
};

export const AllColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-300">
      <InfoCard color="red"    mainValue="$3.6k" description="Total Sales"  subtitles="+8% from yesterday" />
      <InfoCard color="cyan"   mainValue="$5.9k" description="Total Orders" subtitles="+5% from yesterday" />
      <InfoCard color="purple" mainValue="$2.4k" description="Returns"      subtitles="-2% from yesterday" />
      <InfoCard color="amber"  mainValue="$1.2k" description="Cancelled"    subtitles="+3% from yesterday" />
      <InfoCard color="lime"   mainValue="$4.1k" description="Delivered"    subtitles="+12% from yesterday" />
      <InfoCard color="slate"  mainValue="$0.9k" description="Pending"      subtitles="-1% from yesterday" />
    </div>
  ),
};

export const WithCustomIcon: Story = {
  args: { color: "cyan", icon: ICON_OPTIONS["BarChart"], description: "Relatórios", mainValue: "142" },
};
