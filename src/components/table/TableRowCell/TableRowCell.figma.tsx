import figma from "@figma/code-connect";
import { TableRowCell } from "./TableRowCell";

figma.connect(
  TableRowCell,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=455-1457",
  {
    props: {
      alignment: figma.enum("Alignment", {
        Left: "left",
        Center: "center",
        Right: "right",
      }),
    },
    example: ({ alignment }) => (
      <TableRowCell alignment={alignment}>Cell value</TableRowCell>
    ),
  }
);
