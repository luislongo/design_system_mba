import figma from "@figma/code-connect";
import { InfoCard } from "./InfoCard";

figma.connect(
  InfoCard,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=413-403",
  {
    props: {
      color: figma.enum("Color", {
        Red: "red",
        Cyan: "cyan",
        Purple: "purple",
        Amber: "amber",
        Lime: "lime",
        Slate: "slate",
      }),
      layout: figma.enum("Layout", {
        Desktop: "desktop",
        Mobile: "mobile",
      }),
      icon: figma.instance("Icon"),
    },
    example: ({ color, layout, icon }) => (
      <InfoCard color={color} layout={layout} icon={icon} />
    ),
  }
);
