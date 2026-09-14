import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Radio } from "./Radio";

const meta: Meta<typeof Radio> = {
  title: "Components/Inputs/Radio",
  component: Radio,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

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

export const Group: Story = {
  render: () => {
    const options = ["Mensal", "Trimestral", "Anual"];
    const [value, setValue] = useState("Mensal");
    return (
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <label key={opt} className="inline-flex items-center gap-2 cursor-pointer select-none">
            <Radio
              name="periodo"
              value={opt}
              checked={value === opt}
              onChange={() => setValue(opt)}
            />
            <span className="text-sm text-neutral-800">{opt}</span>
          </label>
        ))}
      </div>
    );
  },
};

export const GroupWithDisabled: Story = {
  render: () => {
    const [value, setValue] = useState("Ativo");
    return (
      <div className="flex flex-col gap-3">
        {["Ativo", "Inativo", "Pendente (indisponível)"].map((opt, i) => (
          <label
            key={opt}
            className={[
              "inline-flex items-center gap-2 select-none",
              i === 2 ? "cursor-not-allowed" : "cursor-pointer",
            ].join(" ")}
          >
            <Radio
              name="status"
              value={opt}
              checked={value === opt}
              disabled={i === 2}
              onChange={() => setValue(opt)}
            />
            <span className={["text-sm", i === 2 ? "text-neutral-300" : "text-neutral-800"].join(" ")}>
              {opt}
            </span>
          </label>
        ))}
      </div>
    );
  },
};
