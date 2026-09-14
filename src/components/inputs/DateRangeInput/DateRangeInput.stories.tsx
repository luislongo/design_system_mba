import type { Meta, StoryObj } from "@storybook/react";
import { DateRangeInput } from "./DateRangeInput";

const meta: Meta<typeof DateRangeInput> = {
  title: "Components/Inputs/DateRangeInput",
  component: DateRangeInput,
  tags: ["autodocs"],
  argTypes: {
    startLabel: { control: "text" },
    endLabel: { control: "text" },
    startValue: { control: "text" },
    endValue: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    startLabel: "Data Início",
    endLabel: "Data Fim",
    startValue: "2026-01-01",
    endValue: "2026-01-31",
  },
};

export default meta;
type Story = StoryObj<typeof DateRangeInput>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const CustomLabels: Story = {
  args: {
    startLabel: "De",
    endLabel: "Até",
  },
};

export const Empty: Story = {
  args: {
    startValue: undefined,
    endValue: undefined,
  },
};
