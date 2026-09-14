import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SelectOption } from "./SelectOption";

const meta: Meta<typeof SelectOption> = {
  title: "Components/Inputs/SelectOption",
  component: SelectOption,
  tags: ["autodocs"],
  argTypes: {
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    value: { control: "text" },
  },
  args: {
    value: "opcao-1",
    label: "Opção 1",
  },
};

export default meta;
type Story = StoryObj<typeof SelectOption>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const List: Story = {
  render: () => {
    const options = [
      { value: "opcao-1", label: "Opção 1" },
      { value: "opcao-2", label: "Opção 2" },
      { value: "opcao-3", label: "Opção 3" },
      { value: "opcao-4", label: "Desabilitada", disabled: true },
    ];
    const [selected, setSelected] = useState("opcao-1");
    return (
      <div
        role="listbox"
        className="w-56 border border-neutral-200 rounded-200 overflow-hidden"
      >
        {options.map((opt) => (
          <SelectOption
            key={opt.value}
            value={opt.value}
            label={opt.label}
            selected={selected === opt.value}
            disabled={opt.disabled}
            onClick={() => !opt.disabled && setSelected(opt.value)}
          />
        ))}
      </div>
    );
  },
};
