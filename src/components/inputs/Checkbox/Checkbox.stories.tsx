import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Inputs/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Unchecked: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
};

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
        <Checkbox
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <span className="text-sm text-neutral-800">
          {checked ? "Marcado" : "Desmarcado"}
        </span>
      </label>
    );
  },
};

export const Group: Story = {
  render: () => {
    const options = ["Opção A", "Opção B", "Opção C"];
    const [selected, setSelected] = useState<string[]>(["Opção A"]);
    const toggle = (opt: string) =>
      setSelected((prev) =>
        prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
      );
    return (
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <label key={opt} className="inline-flex items-center gap-2 cursor-pointer select-none">
            <Checkbox
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
            />
            <span className="text-sm text-neutral-800">{opt}</span>
          </label>
        ))}
      </div>
    );
  },
};
