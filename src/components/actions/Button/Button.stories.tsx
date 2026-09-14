import type { Meta, StoryObj } from "@storybook/react";
import { iconArgType } from "../../../stories/icon-options";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Actions/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "tertiary"],
    },
    size: {
      control: "select",
      options: ["sm", "md"],
    },
    disabled: { control: "boolean" },
    startIcon: iconArgType,
    trailingIcon: iconArgType,
  },
  args: {
    children: "Button",
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: "primary" },
};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Tertiary: Story = {
  args: { variant: "tertiary" },
};

export const Disabled: Story = {
  args: { variant: "primary", disabled: true },
};

export const WithStartIcon: Story = {
  args: { variant: "primary", children: "Adicionar", startIcon: "Add" },
};

export const WithTrailingIcon: Story = {
  args: { variant: "secondary", children: "Próximo", trailingIcon: "ArrowForward" },
};

export const WithBothIcons: Story = {
  args: {
    variant: "primary",
    children: "Salvar",
    startIcon: "Save",
    trailingIcon: "Check",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
    </div>
  ),
};
