import type { Meta, StoryObj } from "@storybook/react";
import { ContentGrid } from "./ContentGrid";

const PlaceholderItem = ({ mobile }: { mobile?: boolean }) => (
  <div
    className={[
      "bg-light-900 border border-dashed border-neutral-50 rounded-400",
      mobile ? "w-full h-[280px] shrink-0" : "flex-[1_0_0] h-[280px] min-w-[280px]",
    ].join(" ")}
  />
);

const meta: Meta<typeof ContentGrid> = {
  title: "Components/Layout/ContentGrid",
  component: ContentGrid,
  tags: ["autodocs"],
  argTypes: {
    layout: {
      control: "select",
      options: ["desktop", "mobile"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContentGrid>;

export const Desktop: Story = {
  args: { layout: "desktop" },
  render: ({ layout }) => (
    <ContentGrid layout={layout}>
      <PlaceholderItem />
      <PlaceholderItem />
      <PlaceholderItem />
      <PlaceholderItem />
    </ContentGrid>
  ),
};

export const Mobile: Story = {
  args: { layout: "mobile" },
  render: ({ layout }) => (
    <div style={{ width: 390 }}>
      <ContentGrid layout={layout}>
        <PlaceholderItem mobile />
        <PlaceholderItem mobile />
        <PlaceholderItem mobile />
        <PlaceholderItem mobile />
      </ContentGrid>
    </div>
  ),
};
