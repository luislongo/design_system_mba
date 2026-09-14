import figma from "@figma/code-connect";
import { GraphCard } from "./GraphCard";

figma.connect(
  GraphCard,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=413-569",
  {
    props: {
      titulo: figma.string("Título"),
      children: figma.children("Graph Content"),
    },
    example: ({ titulo, children }) => (
      <GraphCard titulo={titulo}>{children}</GraphCard>
    ),
  }
);
