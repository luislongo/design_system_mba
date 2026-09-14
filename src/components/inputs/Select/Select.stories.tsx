import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select";

const paisOptions = [
  { value: "", label: "Selecione um país" },
  { value: "br", label: "Brasil" },
  { value: "ar", label: "Argentina" },
  { value: "cl", label: "Chile" },
  { value: "co", label: "Colômbia" },
];

const meta: Meta<typeof Select> = {
  title: "Components/Inputs/Select",
  component: Select,
  tags: ["autodocs"],
  argTypes: {
    hasError: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    options: paisOptions,
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: "br" },
};

export const WithError: Story = {
  args: { hasError: true },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "br" },
};

export const WithNativeChildren: Story = {
  args: {
    options: undefined,
    children: (
      <>
        <option value="">Selecione...</option>
        <optgroup label="Região Sul">
          <option value="pr">Paraná</option>
          <option value="sc">Santa Catarina</option>
          <option value="rs">Rio Grande do Sul</option>
        </optgroup>
        <optgroup label="Região Sudeste">
          <option value="sp">São Paulo</option>
          <option value="rj">Rio de Janeiro</option>
          <option value="mg">Minas Gerais</option>
        </optgroup>
      </>
    ),
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-72">
      <Select options={paisOptions} />
      <Select options={paisOptions} defaultValue="br" />
      <Select options={paisOptions} hasError />
      <Select options={paisOptions} disabled defaultValue="br" />
    </div>
  ),
};
