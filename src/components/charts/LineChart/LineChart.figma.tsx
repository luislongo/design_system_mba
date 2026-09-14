import figma from "@figma/code-connect";
import { LineChart } from "./LineChart";

figma.connect(
  LineChart,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=429-922",
  {
    example: () => (
      <LineChart
        data={[
          { name: "Jan",  loyal: 330, new: 260, unique: 340 },
          { name: "Feb",  loyal: 300, new: 250, unique: 300 },
          { name: "Mar",  loyal: 320, new: 220, unique: 320 },
          { name: "Apr",  loyal: 250, new: 200, unique: 240 },
          { name: "May",  loyal: 210, new: 215, unique: 215 },
          { name: "Jun",  loyal: 220, new: 260, unique: 260 },
          { name: "Jul",  loyal: 260, new: 310, unique: 330 },
          { name: "Sept", loyal: 310, new: 310, unique: 310 },
          { name: "Oct",  loyal: 270, new: 280, unique: 200 },
          { name: "Nov",  loyal: 130, new: 110, unique: 150 },
          { name: "Dec",  loyal: 150, new: 90,  unique: 230 },
        ]}
        series={[
          { key: "loyal",  name: "Loyal Customers",  color: "#a700ff" },
          { key: "new",    name: "New Customers",    color: "#ef4444" },
          { key: "unique", name: "Unique Customers", color: "#3cd856" },
        ]}
      />
    ),
  }
);
