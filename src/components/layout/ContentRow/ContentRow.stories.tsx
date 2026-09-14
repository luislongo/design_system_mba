import type { Meta, StoryObj } from "@storybook/react";
import { ContentRow } from "./ContentRow";

const PlaceholderCard = ({ mobile }: { mobile?: boolean }) => (
  <div
    className={[
      "bg-light-900 border border-dashed border-neutral-50 rounded-400 flex-[1_0_0]",
      mobile ? "h-[140px] min-w-[120px]" : "h-full min-w-[120px]",
    ].join(" ")}
  />
);

const meta: Meta<typeof ContentRow> = {
  title: "Components/Layout/ContentRow",
  component: ContentRow,
  tags: ["autodocs"],
  argTypes: {
    layout: {
      control: "select",
      options: ["desktop", "mobile"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContentRow>;

export const Desktop: Story = {
  args: { layout: "desktop" },
  render: ({ layout }) => (
    <ContentRow layout={layout}>
      <PlaceholderCard />
      <PlaceholderCard />
      <PlaceholderCard />
      <PlaceholderCard />
    </ContentRow>
  ),
};

export const Mobile: Story = {
  args: { layout: "mobile" },
  render: ({ layout }) => (
    <div style={{ width: 390 }}>
      <ContentRow layout={layout}>
        <PlaceholderCard mobile />
        <PlaceholderCard mobile />
        <PlaceholderCard mobile />
        <PlaceholderCard mobile />
      </ContentRow>
    </div>
  ),
};
