import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SearchInput } from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Components/Inputs/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Closed: Story = {
  args: { open: false },
};

export const Open: Story = {
  args: { open: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    return (
      <div className="flex flex-col gap-2">
        <SearchInput
          open={open}
          onOpenChange={setOpen}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar componente..."
        />
        {query && (
          <p className="text-xs text-neutral-400">Buscando: "{query}"</p>
        )}
      </div>
    );
  },
};

export const InToolbar: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-200 w-fit">
        <span className="text-sm text-neutral-600">Toolbar</span>
        <div className="w-px h-5 bg-neutral-200" />
        <SearchInput open={open} onOpenChange={setOpen} />
      </div>
    );
  },
};
