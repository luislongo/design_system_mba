import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "./ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  title: "Components/Data Display/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  argTypes: {
    color: { control: "select", options: ["blue", "green", "purple", "orange"] },
    value: { control: { type: "range", min: 0, max: 100 } },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Blue: Story = { args: { value: 60, color: "blue" } };
export const Green: Story = { args: { value: 45, color: "green" } };
export const Purple: Story = { args: { value: 30, color: "purple" } };
export const Orange: Story = { args: { value: 75, color: "orange" } };

export const AllColors: Story = {
  render: () => (
    <div className="flex flex-col gap-200 w-48">
      <ProgressBar value={60} color="blue" />
      <ProgressBar value={45} color="green" />
      <ProgressBar value={30} color="purple" />
      <ProgressBar value={75} color="orange" />
    </div>
  ),
};
