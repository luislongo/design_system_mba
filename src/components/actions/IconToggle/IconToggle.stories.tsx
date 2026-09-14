import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { iconArgType, ICON_OPTIONS } from "../../../stories/icon-options";
import { IconToggle } from "./IconToggle";

const meta: Meta<typeof IconToggle> = {
  title: "Components/Actions/IconToggle",
  component: IconToggle,
  tags: ["autodocs"],
  argTypes: {
    active: { control: "select", options: ["left", "right"] },
    size: { control: "select", options: ["default", "large"] },
    disabled: { control: "boolean" },
    leftIcon: iconArgType,
    rightIcon: iconArgType,
  },
  args: {
    leftIcon: "List",
    rightIcon: "Dashboard",
  },
};

export default meta;
type Story = StoryObj<typeof IconToggle>;

export const LeftActive: Story = {
  args: { active: "left" },
};

export const RightActive: Story = {
  args: { active: "right" },
};

export const Large: Story = {
  args: { size: "large" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Controlled: Story = {
  render: (args) => {
    const [active, setActive] = useState<"left" | "right">("left");
    return (
      <IconToggle
        {...args}
        active={active}
        onLeftClick={() => setActive("left")}
        onRightClick={() => setActive("right")}
      />
    );
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconToggle
        size="default"
        leftIcon={ICON_OPTIONS["List"]}
        rightIcon={ICON_OPTIONS["Dashboard"]}
        active="left"
      />
      <IconToggle
        size="large"
        leftIcon={ICON_OPTIONS["List"]}
        rightIcon={ICON_OPTIONS["Dashboard"]}
        active="left"
      />
    </div>
  ),
};
