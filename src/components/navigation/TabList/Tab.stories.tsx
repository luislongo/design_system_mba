import type { Meta, StoryObj } from "@storybook/react";
import { Tab } from "./Tab";

const meta: Meta<typeof Tab> = {
  title: "Components/Navigation/Tab",
  component: Tab,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    size: { control: "select", options: ["Default", "Large"] },
    active: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Tab",
  },
};

export default meta;
type Story = StoryObj<typeof Tab>;

export const Default: Story = {};

export const Active: Story = {
  args: { active: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Large: Story = {
  args: { size: "Large" },
};

export const LargeActive: Story = {
  args: { size: "Large", active: true },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex items-end gap-300">
      <Tab label="Default" />
      <Tab label="Active"   active />
      <Tab label="Disabled" disabled />
    </div>
  ),
};

export const BothSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-400">
      <div className="flex items-end gap-300">
        <Tab size="Default" label="Default" />
        <Tab size="Default" label="Active" active />
        <Tab size="Default" label="Disabled" disabled />
      </div>
      <div className="flex items-end gap-300">
        <Tab size="Large" label="Default" />
        <Tab size="Large" label="Active" active />
        <Tab size="Large" label="Disabled" disabled />
      </div>
    </div>
  ),
};
