import type { Meta, StoryObj } from "@storybook/react";
import { iconArgType, ICON_OPTIONS } from "../../../stories/icon-options";
import { DangerButton } from "./DangerButton";

const meta: Meta<typeof DangerButton> = {
  title: "Components/Actions/DangerButton",
  component: DangerButton,
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
    children: "Delete",
  },
};

export default meta;
type Story = StoryObj<typeof DangerButton>;

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

export const WithIcon: Story = {
  args: { variant: "primary", startIcon: "Delete" },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <DangerButton size="sm">Small</DangerButton>
      <DangerButton size="md">Medium</DangerButton>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <DangerButton variant="primary">Primary</DangerButton>
      <DangerButton variant="secondary">Secondary</DangerButton>
      <DangerButton variant="tertiary">Tertiary</DangerButton>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <DangerButton variant="primary" startIcon={ICON_OPTIONS["Delete"]}>Excluir</DangerButton>
      <DangerButton variant="secondary" startIcon={ICON_OPTIONS["Block"]}>Bloquear</DangerButton>
    </div>
  ),
};
