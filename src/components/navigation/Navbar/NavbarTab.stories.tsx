import type { Meta, StoryObj } from "@storybook/react";
import { iconArgType, ICON_OPTIONS } from "../../../stories/icon-options";
import { Navbar } from "./Navbar";
import { NavbarTab } from "./NavbarTab";

const meta: Meta<typeof NavbarTab> = {
  title: "Components/Navigation/NavbarTab",
  component: NavbarTab,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Navbar>
        <Story />
      </Navbar>
    ),
  ],
  argTypes: {
    label: { control: "text" },
    active: { control: "boolean" },
    disabled: { control: "boolean" },
    size: { control: "select", options: ["desktop", "mobile"] },
    icon: iconArgType,
  },
  args: {
    label: "Início",
    active: false,
    size: "desktop",
    icon: "Home",
  },
};

export default meta;
type Story = StoryObj<typeof NavbarTab>;

export const Default: Story = {};

export const Active: Story = {
  args: { active: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Mobile: Story = {
  args: { size: "mobile" },
};

export const MobileActive: Story = {
  args: { size: "mobile", active: true },
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-600">
      <div>
        <p className="text-xs text-neutral-400 mb-200">Desktop</p>
        <Navbar>
          <NavbarTab label="Inativo" icon={ICON_OPTIONS["Home"]} size="desktop" />
          <NavbarTab label="Ativo" icon={ICON_OPTIONS["BarChart"]} size="desktop" active />
          <NavbarTab label="Desabilitado" icon={ICON_OPTIONS["Settings"]} size="desktop" disabled />
        </Navbar>
      </div>
      <div>
        <p className="text-xs text-neutral-400 mb-200">Mobile</p>
        <Navbar>
          <NavbarTab label="Inativo" icon={ICON_OPTIONS["Home"]} size="mobile" />
          <NavbarTab label="Ativo" icon={ICON_OPTIONS["BarChart"]} size="mobile" active />
          <NavbarTab label="Desabilitado" icon={ICON_OPTIONS["Settings"]} size="mobile" disabled />
        </Navbar>
      </div>
    </div>
  ),
};
