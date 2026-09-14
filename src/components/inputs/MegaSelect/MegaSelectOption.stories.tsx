import type { Meta, StoryObj } from "@storybook/react";
import { MegaSelectOption } from "./MegaSelectOption";

const meta: Meta<typeof MegaSelectOption> = {
  title: "Components/Inputs/MegaSelectOption",
  component: MegaSelectOption,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    value: { control: "text" },
    selected: { control: "boolean" },
    active: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Opção de exemplo",
    value: "example",
  },
};

export default meta;
type Story = StoryObj<typeof MegaSelectOption>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const Active: Story = {
  args: { active: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col w-48 border border-neutral-200 rounded-200 overflow-hidden">
      <MegaSelectOption value="a" label="Default"  />
      <MegaSelectOption value="b" label="Selected" selected />
      <MegaSelectOption value="c" label="Active (teclado)" active />
      <MegaSelectOption value="d" label="Disabled" disabled />
    </div>
  ),
};
