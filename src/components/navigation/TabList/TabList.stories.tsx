import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TabList } from "./TabList";
import { Tab } from "./Tab";

const meta: Meta<typeof TabList> = {
  title: "Components/Navigation/TabList",
  component: TabList,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["Default", "Large"] },
  },
};

export default meta;
type Story = StoryObj<typeof TabList>;

export const Default: Story = {
  render: (args) => (
    <TabList {...args}>
      <Tab label="Visão geral" active />
      <Tab label="Detalhes" />
      <Tab label="Histórico" />
    </TabList>
  ),
};

export const Large: Story = {
  render: (args) => (
    <TabList {...args} size="Large">
      <Tab label="Visão geral" size="Large" active />
      <Tab label="Detalhes" size="Large" />
      <Tab label="Histórico" size="Large" />
    </TabList>
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <TabList>
      <Tab label="Visão geral" active />
      <Tab label="Detalhes" />
      <Tab label="Histórico" disabled />
    </TabList>
  ),
};

export const Controlled: Story = {
  render: () => {
    const tabs = ["Visão geral", "Detalhes", "Histórico", "Configurações"];
    const [active, setActive] = useState("Visão geral");
    return (
      <TabList>
        {tabs.map((tab) => (
          <Tab
            key={tab}
            label={tab}
            active={active === tab}
            onClick={() => setActive(tab)}
          />
        ))}
      </TabList>
    );
  },
};

export const ControlledLarge: Story = {
  render: () => {
    const tabs = ["Resumo", "Métricas", "Logs"];
    const [active, setActive] = useState("Resumo");
    return (
      <TabList size="Large">
        {tabs.map((tab) => (
          <Tab
            key={tab}
            label={tab}
            size="Large"
            active={active === tab}
            onClick={() => setActive(tab)}
          />
        ))}
      </TabList>
    );
  },
};

export const TabStates: Story = {
  render: () => (
    <div className="flex flex-col gap-600">
      <div>
        <p className="text-xs text-neutral-400 mb-200">Padrão (Default size)</p>
        <TabList>
          <Tab label="Inativo" />
          <Tab label="Ativo" active />
          <Tab label="Desabilitado" disabled />
        </TabList>
      </div>
      <div>
        <p className="text-xs text-neutral-400 mb-200">Grande (Large size)</p>
        <TabList size="Large">
          <Tab label="Inativo" size="Large" />
          <Tab label="Ativo" size="Large" active />
          <Tab label="Desabilitado" size="Large" disabled />
        </TabList>
      </div>
    </div>
  ),
};
