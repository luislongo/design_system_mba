import type { Meta, StoryObj } from "@storybook/react";
import { ProgressTable } from "./ProgressTable";

const meta: Meta<typeof ProgressTable> = {
  title: "Components/Table/ProgressTable",
  component: ProgressTable,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProgressTable>;

const sampleData = [
  { id: "01", name: "Home Decor Range", popularity: 60, sales: 45, color: "blue" as const },
  { id: "02", name: "Disney Princess Pink Bag 18'", popularity: 40, sales: 29, color: "green" as const },
  { id: "03", name: "Bathroom Essentials", popularity: 25, sales: 18, color: "purple" as const },
  { id: "04", name: "Apple Smartwatches", popularity: 35, sales: 25, color: "orange" as const },
];

export const Default: Story = {
  args: { data: sampleData },
};

export const Empty: Story = {
  args: { data: [] },
};
