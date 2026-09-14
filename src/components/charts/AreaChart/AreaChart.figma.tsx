import figma from "@figma/code-connect";
import { AreaChart } from "./AreaChart";

figma.connect(
  AreaChart,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=429-961",
  {
    example: () => (
      <AreaChart
        data={[
          { name: "Jan", thisMonth: 360, lastMonth: 160 },
          { name: "Feb", thisMonth: 300, lastMonth: 220 },
          { name: "Mar", thisMonth: 320, lastMonth: 80  },
          { name: "Apr", thisMonth: 260, lastMonth: 80  },
          { name: "May", thisMonth: 340, lastMonth: 130 },
          { name: "Jun", thisMonth: 280, lastMonth: 120 },
          { name: "Jul", thisMonth: 200, lastMonth: 220 },
          { name: "Aug", thisMonth: 210, lastMonth: 220 },
        ]}
        series={[
          { key: "lastMonth", name: "Last Month", color: "#0095ff" },
          { key: "thisMonth", name: "This Month", color: "#00e096" },
        ]}
      />
    ),
  }
);
