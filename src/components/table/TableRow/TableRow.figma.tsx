import figma from "@figma/code-connect";
import { TableRow } from "./TableRow";
import { TableRowCell } from "../TableRowCell";

figma.connect(
  TableRow,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=455-1471",
  {
    example: () => (
      <TableRow>
        <TableRowCell>Cell value</TableRowCell>
        <TableRowCell>Cell value</TableRowCell>
        <TableRowCell>Cell value</TableRowCell>
      </TableRow>
    ),
  }
);
