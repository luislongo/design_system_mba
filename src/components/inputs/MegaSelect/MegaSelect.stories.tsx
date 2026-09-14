import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MegaSelect, type MegaSelectItem } from "./MegaSelect";

const estados: MegaSelectItem[] = [
  { value: "AC", label: "Acre" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal", disabled: true },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PR", label: "Paraná" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
];

const meta: Meta<typeof MegaSelect> = {
  title: "Components/Inputs/MegaSelect",
  component: MegaSelect,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div className="w-[280px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MegaSelect>;

export const Default: Story = {
  args: { options: estados },
};

export const WithValue: Story = {
  args: { options: estados, value: "MG" },
};

export const Disabled: Story = {
  args: { options: estados, value: "SP", disabled: true },
};

export const Empty: Story = {
  args: { options: [], placeholder: "Nenhuma opção disponível" },
};

/** Estado controlado — exercita `onChange`, teclado e retorno de foco. */
export const Controlled: Story = {
  render: () => {
    const [uf, setUf] = useState<string>();
    return (
      <div className="flex flex-col gap-400">
        <MegaSelect options={estados} value={uf} onChange={setUf} placeholder="Escolha o estado" />
        <p className="text-sm text-neutral-600 font-sans">
          Selecionado: <strong className="text-neutral-800">{uf ?? "—"}</strong>
        </p>
        <p className="text-xs text-neutral-400 font-sans">
          Teclado: Enter/Espaço/↓/↑ abre · ↑↓ navega · Home/End extremos · Enter seleciona ·
          Escape fecha · Tab sai. A opção &ldquo;Distrito Federal&rdquo; está desabilitada e é
          pulada pela navegação.
        </p>
      </div>
    );
  },
};
