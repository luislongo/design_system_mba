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
    icon: iconArgType,
  },
  args: {
    label: "Início",
    active: false,
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

export const WithoutIcon: Story = {
  args: { icon: "None" },
};

export const States: Story = {
  render: () => (
    <Navbar>
      <NavbarTab label="Inativo" icon={ICON_OPTIONS["Home"]} />
      <NavbarTab label="Ativo" icon={ICON_OPTIONS["BarChart"]} active />
      <NavbarTab label="Desabilitado" icon={ICON_OPTIONS["Settings"]} disabled />
    </Navbar>
  ),
};
