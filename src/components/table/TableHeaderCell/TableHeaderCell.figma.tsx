import figma from "@figma/code-connect";
import { TableHeaderCell } from "./TableHeaderCell";

figma.connect(
  TableHeaderCell,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=455-1444",
  {
    props: {
      sortable: figma.boolean("Sortable"),
      sort: figma.enum("Sort", {
        None: "none",
        Ascending: "ascending",
        Descending: "descending",
      }),
    },
    example: ({ sortable, sort }) => (
      <TableHeaderCell sortable={sortable} sort={sort}>
        Column Header
      </TableHeaderCell>
    ),
  }
);
