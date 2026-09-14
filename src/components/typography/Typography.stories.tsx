import type { Meta, StoryObj } from "@storybook/react";
import { H1, H2, H3, Subtitle, Body, Description, Label, Caption } from "./Typography";

const meta: Meta = {
  title: "Components/Typography",
  tags: ["autodocs"],
};

export default meta;

export const Headings: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-400">
      <H1>H1 — Título Principal</H1>
      <H2>H2 — Título Secundário</H2>
      <H3>H3 — Título Terciário</H3>
    </div>
  ),
};

export const TextStyles: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-300">
      <Subtitle>Subtitle — Subtítulo de seção</Subtitle>
      <Body>Body — Texto corrido, parágrafos e conteúdo principal da interface.</Body>
      <Description>Description — Texto auxiliar, descrições curtas e metadados.</Description>
      <Label>Label — Rótulo de campo de formulário</Label>
      <Caption>Caption — Legenda, nota de rodapé ou texto complementar</Caption>
    </div>
  ),
};

export const AllScale: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-300">
      <H1>H1 · 30px / semibold</H1>
      <H2>H2 · 24px / semibold</H2>
      <H3>H3 · 20px / semibold</H3>
      <Subtitle>Subtitle · 18px / regular</Subtitle>
      <Body>Body · 16px / regular</Body>
      <Description>Description · 14px / regular</Description>
      <Label>Label · 12px / regular</Label>
      <Caption>Caption · 12px / regular</Caption>
    </div>
  ),
};

export const H1Story: StoryObj<typeof H1> = {
  name: "H1",
  render: (args) => <H1 {...args} />,
  args: { children: "Título Principal" },
};

export const H2Story: StoryObj<typeof H2> = {
  name: "H2",
  render: (args) => <H2 {...args} />,
  args: { children: "Título Secundário" },
};

export const H3Story: StoryObj<typeof H3> = {
  name: "H3",
  render: (args) => <H3 {...args} />,
  args: { children: "Título Terciário" },
};

export const SubtitleStory: StoryObj<typeof Subtitle> = {
  name: "Subtitle",
  render: (args) => <Subtitle {...args} />,
  args: { children: "Subtítulo de seção" },
};

export const BodyStory: StoryObj<typeof Body> = {
  name: "Body",
  render: (args) => <Body {...args} />,
  args: { children: "Texto corrido da interface." },
};

export const DescriptionStory: StoryObj<typeof Description> = {
  name: "Description",
  render: (args) => <Description {...args} />,
  args: { children: "Texto auxiliar e descrições curtas." },
};

export const LabelStory: StoryObj<typeof Label> = {
  name: "Label",
  render: (args) => <Label {...args} />,
  args: { children: "Rótulo de campo" },
};

export const CaptionStory: StoryObj<typeof Caption> = {
  name: "Caption",
  render: (args) => <Caption {...args} />,
  args: { children: "Legenda ou nota complementar" },
};
