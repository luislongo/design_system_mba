import type { Meta, StoryObj } from "@storybook/react";
import { ProgressChip } from "./ProgressChip";

const meta: Meta<typeof ProgressChip> = {
  title: "Components/Data Display/ProgressChip",
  component: ProgressChip,
  tags: ["autodocs"],
  argTypes: {
    color: { control: "select", options: ["blue", "green", "purple", "orange"] },
    value: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressChip>;

export const Blue: Story = { args: { value: "45%", color: "blue" } };
export const Green: Story = { args: { value: "29%", color: "green" } };
export const Purple: Story = { args: { value: "18%", color: "purple" } };
export const Orange: Story = { args: { value: "25%", color: "orange" } };

export const AllColors: Story = {
  render: () => (
    <div className="flex gap-200">
      <ProgressChip value="45%" color="blue" />
      <ProgressChip value="29%" color="green" />
      <ProgressChip value="18%" color="purple" />
      <ProgressChip value="25%" color="orange" />
    </div>
  ),
};
