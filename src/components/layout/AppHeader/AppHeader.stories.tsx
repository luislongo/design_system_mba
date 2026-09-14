import type { Meta, StoryObj } from "@storybook/react";
import { AppHeader } from "./AppHeader";
import { IconLocalLibrary } from "../../icons/IconLocalLibrary";
import { IconHome } from "../../icons/IconHome";
import { IconBarChart } from "../../icons/IconBarChart";
import { IconSettings } from "../../icons/IconSettings";
import { Navbar } from "../../navigation/Navbar/Navbar";
import { NavbarTab } from "../../navigation/Navbar/NavbarTab";

const Avatar = () => (
  <div className="size-full rounded-full bg-neutral-200 overflow-hidden">
    <div className="w-full h-full bg-primary-200 flex items-center justify-center text-primary-700 font-sans text-sm font-semibold">
      U
    </div>
  </div>
);

const meta: Meta<typeof AppHeader> = {
  title: "Components/Layout/AppHeader",
  component: AppHeader,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["desktop", "mobile"],
    },
    title: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof AppHeader>;

export const Desktop: Story = {
  args: { size: "desktop", title: "Título" },
  render: ({ size, title }) => (
    <AppHeader
      size={size}
      title={title}
      icon={<IconLocalLibrary />}
      navbar={
        <Navbar>
          <NavbarTab label="Aba 1" icon={<IconHome />} active />
          <NavbarTab label="Aba 2" icon={<IconBarChart />} />
          <NavbarTab label="Aba 3" icon={<IconSettings />} />
        </Navbar>
      }
      avatar={<Avatar />}
    />
  ),
};

export const Mobile: Story = {
  args: { size: "mobile", title: "Título" },
  render: ({ size, title }) => (
    <div style={{ width: 360 }}>
      <AppHeader
        size={size}
        title={title}
        icon={<IconLocalLibrary />}
        navbar={
          <Navbar>
            <NavbarTab label="Aba 1" icon={<IconHome />} size="mobile" active />
            <NavbarTab label="Aba 2" icon={<IconBarChart />} size="mobile" />
            <NavbarTab label="Aba 3" icon={<IconSettings />} size="mobile" />
          </Navbar>
        }
        avatar={<Avatar />}
      />
    </div>
  ),
};

export const NoAvatar: Story = {
  args: { size: "desktop", title: "Título" },
  render: ({ size, title }) => (
    <AppHeader size={size} title={title} icon={<IconLocalLibrary />} />
  ),
};
