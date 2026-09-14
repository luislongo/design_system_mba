import type { Meta, StoryObj } from "@storybook/react";
import { iconArgType, ICON_OPTIONS } from "../../../stories/icon-options";
import { HeroButton } from "./HeroButton";

const meta: Meta<typeof HeroButton> = {
  title: "Components/Actions/HeroButton",
  component: HeroButton,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary"],
    },
    disabled: { control: "boolean" },
    startIcon: iconArgType,
    trailingIcon: iconArgType,
  },
  args: {
    children: "Get Started",
  },
};

export default meta;
type Story = StoryObj<typeof HeroButton>;

export const Primary: Story = {
  args: { variant: "primary" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Learn More" },
};

export const Disabled: Story = {
  args: { variant: "primary", disabled: true },
};

export const WithIcon: Story = {
  args: { variant: "primary", children: "Começar", startIcon: "ArrowForward" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <HeroButton variant="primary">Primary</HeroButton>
      <HeroButton variant="secondary">Secondary</HeroButton>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <HeroButton variant="primary" startIcon={ICON_OPTIONS["ArrowForward"]}>Começar</HeroButton>
      <HeroButton variant="secondary" trailingIcon={ICON_OPTIONS["ChevronRight"]}>Learn More</HeroButton>
    </div>
  ),
};
