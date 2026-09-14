import type { Meta, StoryObj } from "@storybook/react";
import { FormGroup } from "./FormGroup";

const meta: Meta<typeof FormGroup> = {
  title: "Components/Inputs/FormGroup",
  component: FormGroup,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    error: { control: "text" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: {
    label: "E-mail",
    placeholder: "voce@exemplo.com",
  },
};

export default meta;
type Story = StoryObj<typeof FormGroup>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: "usuario@empresa.com" },
};

export const WithError: Story = {
  args: {
    error: "E-mail inválido",
    defaultValue: "nao-e-email",
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "somente-leitura@exemplo.com" },
};

export const WithoutLabel: Story = {
  args: { label: undefined, placeholder: "Campo sem label" },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-72">
      <FormGroup label="Padrão" placeholder="voce@exemplo.com" />
      <FormGroup label="Preenchido" defaultValue="usuario@empresa.com" />
      <FormGroup
        label="Com erro"
        error="E-mail inválido"
        defaultValue="nao-e-email"
      />
      <FormGroup label="Desabilitado" disabled defaultValue="somente-leitura@exemplo.com" />
    </div>
  ),
};
