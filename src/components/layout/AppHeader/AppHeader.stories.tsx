import type { Meta, StoryObj } from "@storybook/react";
import { AppHeader } from "./AppHeader";
import { IconLocalLibrary } from "../../icons/IconLocalLibrary";

const Avatar = () => (
  <div className="size-1200 rounded-full bg-neutral-200 overflow-hidden shrink-0">
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
      avatar={<Avatar />}
    />
  ),
};

export const Mobile: Story = {
  args: { size: "mobile", title: "Título" },
  render: ({ size, title }) => (
    <div style={{ width: 302 }}>
      <AppHeader
        size={size}
        title={title}
        icon={<IconLocalLibrary />}
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
