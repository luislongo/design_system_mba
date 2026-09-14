import figma from "@figma/code-connect";
import { ContentRow } from "./ContentRow";

figma.connect(
  ContentRow,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=473-83",
  {
    props: {
      layout: figma.enum("Layout", {
        Desktop: "desktop",
        Mobile: "mobile",
      }),
    },
    example: ({ layout }) => <ContentRow layout={layout} />,
  }
);
