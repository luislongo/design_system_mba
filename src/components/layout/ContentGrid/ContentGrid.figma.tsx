import figma from "@figma/code-connect";
import { ContentGrid } from "./ContentGrid";

figma.connect(
  ContentGrid,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=470-849",
  {
    props: {
      layout: figma.enum("Layout", {
        Desktop: "desktop",
        Mobile: "mobile",
      }),
    },
    example: ({ layout }) => <ContentGrid layout={layout} />,
  }
);
