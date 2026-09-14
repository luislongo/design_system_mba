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

export const Desktop: Story = {
  render: () => (
    <Navbar>
      <NavbarTab label="Início" icon={ICON_OPTIONS["Home"]} active />
      <NavbarTab label="Relatórios" icon={ICON_OPTIONS["BarChart"]} />
      <NavbarTab label="Configurações" icon={ICON_OPTIONS["Settings"]} />
    </Navbar>
  ),
};

export const Mobile: Story = {
  render: () => (
    <div style={{ width: 390 }}>
      <Navbar>
        <NavbarTab label="Início" icon={ICON_OPTIONS["Home"]} size="mobile" active />
        <NavbarTab label="Relatórios" icon={ICON_OPTIONS["BarChart"]} size="mobile" />
        <NavbarTab label="Config." icon={ICON_OPTIONS["Settings"]} size="mobile" />
      </Navbar>
    </div>
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
