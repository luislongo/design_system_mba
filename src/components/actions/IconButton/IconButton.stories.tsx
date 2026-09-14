import type { Meta, StoryObj } from "@storybook/react";
import { iconArgType, ICON_OPTIONS } from "../../../stories/icon-options";
import { IconButton } from "./IconButton";

const meta: Meta<typeof IconButton> = {
  title: "Components/Actions/IconButton",
  component: IconButton,
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
    icon: iconArgType,
  },
  args: {
    icon: "Settings",
    "aria-label": "Action",
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Primary: Story = {
  args: { variant: "primary", size: "md" },
};

export const Secondary: Story = {
  args: { variant: "secondary", size: "md" },
};

export const Tertiary: Story = {
  args: { variant: "tertiary", size: "md" },
};

export const Disabled: Story = {
  args: { variant: "primary", size: "md", disabled: true },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <IconButton size="sm" icon={ICON_OPTIONS["Search"]} aria-label="Small action" />
      <IconButton size="md" icon={ICON_OPTIONS["Search"]} aria-label="Medium action" />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton variant="primary" icon={ICON_OPTIONS["Add"]} aria-label="Primary" />
      <IconButton variant="secondary" icon={ICON_OPTIONS["Edit"]} aria-label="Secondary" />
      <IconButton variant="tertiary" icon={ICON_OPTIONS["Delete"]} aria-label="Tertiary" />
    </div>
  ),
};
