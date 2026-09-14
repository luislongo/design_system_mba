import figma from "@figma/code-connect";
import { TableHeaderRow } from "./TableHeaderRow";
import { TableHeaderCell } from "../TableHeaderCell";

figma.connect(
  TableHeaderRow,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=455-1461",
  {
    example: () => (
      <TableHeaderRow>
        <TableHeaderCell>Column Header</TableHeaderCell>
        <TableHeaderCell>Column Header</TableHeaderCell>
        <TableHeaderCell>Column Header</TableHeaderCell>
      </TableHeaderRow>
    ),
  }
);
