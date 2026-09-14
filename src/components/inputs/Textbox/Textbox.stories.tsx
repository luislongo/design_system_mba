import type { Meta, StoryObj } from "@storybook/react";
import { Textbox } from "./Textbox";

const meta: Meta<typeof Textbox> = {
  title: "Components/Inputs/Textbox",
  component: Textbox,
  tags: ["autodocs"],
  argTypes: {
    hasError: { control: "boolean" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: {
    placeholder: "Digite aqui...",
  },
};

export default meta;
type Story = StoryObj<typeof Textbox>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: "Valor preenchido" },
};

export const WithError: Story = {
  args: { hasError: true, defaultValue: "email@invalido" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Não editável" },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-72">
      <Textbox placeholder="Vazio" />
      <Textbox defaultValue="Com valor" />
      <Textbox hasError defaultValue="Com erro" />
      <Textbox disabled defaultValue="Desabilitado" />
    </div>
  ),
};
