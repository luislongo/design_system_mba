import type { Meta, StoryObj } from "@storybook/react";
import { DoubleColumn } from "./DoubleColumn";

const PlaceholderSlot = () => (
  <div className="bg-light-900 border border-dashed border-neutral-50 rounded-400 w-full h-[200px]" />
);

const meta: Meta<typeof DoubleColumn> = {
  title: "Components/Layout/DoubleColumn",
  component: DoubleColumn,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["desktop", "mobile"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DoubleColumn>;

export const Desktop: Story = {
  args: { size: "desktop" },
  render: ({ size }) => (
    <DoubleColumn size={size} slotLeft={<PlaceholderSlot />} slotRight={<PlaceholderSlot />} />
  ),
};

export const Mobile: Story = {
  args: { size: "mobile" },
  render: ({ size }) => (
    <div style={{ width: 408 }}>
      <DoubleColumn size={size} slotLeft={<PlaceholderSlot />} slotRight={<PlaceholderSlot />} />
    </div>
  ),
};
