import figma from "@figma/code-connect";
import { ProgressTable } from "./ProgressTable";

figma.connect(
  ProgressTable,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=461-1489",
  {
    example: () => (
      <ProgressTable
        data={[
          { id: "01", name: "Home Decor Range", popularity: 60, sales: 45, color: "blue" },
          { id: "02", name: "Disney Princess Pink Bag 18'", popularity: 40, sales: 29, color: "green" },
          { id: "03", name: "Bathroom Essentials", popularity: 25, sales: 18, color: "purple" },
          { id: "04", name: "Apple Smartwatches", popularity: 35, sales: 25, color: "orange" },
        ]}
      />
    ),
  }
);
