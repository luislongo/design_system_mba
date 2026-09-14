import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ICON_OPTIONS } from "../../../stories/icon-options";
import { Navbar } from "./Navbar";
import { NavbarTab } from "./NavbarTab";

const meta: Meta<typeof Navbar> = {
  title: "Components/Navigation/Navbar",
  component: Navbar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
  render: () => (
    <Navbar>
      <NavbarTab label="Início" icon={ICON_OPTIONS["Home"]} active />
      <NavbarTab label="Relatórios" icon={ICON_OPTIONS["BarChart"]} />
      <NavbarTab label="Configurações" icon={ICON_OPTIONS["Settings"]} />
    </Navbar>
  ),
};

export const WithoutIcons: Story = {
  render: () => (
    <Navbar>
      <NavbarTab label="Dashboard" active />
      <NavbarTab label="Projetos" />
      <NavbarTab label="Equipe" />
      <NavbarTab label="Relatórios" />
    </Navbar>
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <Navbar>
      <NavbarTab label="Início" icon={ICON_OPTIONS["Home"]} active />
      <NavbarTab label="Relatórios" icon={ICON_OPTIONS["BarChart"]} />
      <NavbarTab label="Configurações" icon={ICON_OPTIONS["Settings"]} disabled />
    </Navbar>
  ),
};

export const Controlled: Story = {
  render: () => {
    const tabs = [
      { id: "home", label: "Início", icon: ICON_OPTIONS["Home"] },
      { id: "reports", label: "Relatórios", icon: ICON_OPTIONS["ShowChart"] },
      { id: "settings", label: "Configurações", icon: ICON_OPTIONS["Settings"] },
    ];
    const [active, setActive] = useState("home");
    return (
      <Navbar>
        {tabs.map((tab) => (
          <NavbarTab
            key={tab.id}
            label={tab.label}
            icon={tab.icon}
            active={active === tab.id}
            onClick={() => setActive(tab.id)}
          />
        ))}
      </Navbar>
    );
  },
};

export const NavbarTabStates: Story = {
  render: () => (
    <div className="flex flex-col gap-600">
      <div>
        <p className="text-xs text-neutral-400 mb-200">Inativo</p>
        <Navbar>
          <NavbarTab label="Aba" icon={ICON_OPTIONS["Home"]} />
        </Navbar>
      </div>
      <div>
        <p className="text-xs text-neutral-400 mb-200">Ativo</p>
        <Navbar>
          <NavbarTab label="Aba" icon={ICON_OPTIONS["Home"]} active />
        </Navbar>
      </div>
      <div>
        <p className="text-xs text-neutral-400 mb-200">Desabilitado</p>
        <Navbar>
          <NavbarTab label="Aba" icon={ICON_OPTIONS["Home"]} disabled />
        </Navbar>
      </div>
    </div>
  ),
};
