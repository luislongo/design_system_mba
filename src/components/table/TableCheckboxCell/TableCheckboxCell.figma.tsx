import figma from "@figma/code-connect";
import { TableCheckboxCell } from "./TableCheckboxCell";

figma.connect(
  TableCheckboxCell,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=455-1458",
  {
    props: {},
    example: () => <TableCheckboxCell />,
  }
);
