import type { Meta, StoryObj } from "@storybook/react";
import { GraphCard } from "./GraphCard";

const meta: Meta<typeof GraphCard> = {
  title: "Components/Data Display/GraphCard",
  component: GraphCard,
  tags: ["autodocs"],
  argTypes: {
    titulo: { control: "text" },
  },
  args: {
    titulo: "Vendas",
  },
};

export default meta;
type Story = StoryObj<typeof GraphCard>;

export const Default: Story = {};

export const CustomTitle: Story = {
  args: { titulo: "Top Produtos" },
};

export const WithChildren: Story = {
  render: () => (
    <GraphCard titulo="Receita Mensal">
      <p className="font-sans text-sm text-neutral-400">Conteúdo customizado aqui.</p>
    </GraphCard>
  ),
};
