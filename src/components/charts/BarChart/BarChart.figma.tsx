import figma from "@figma/code-connect";
import { BarChart } from "./BarChart";

figma.connect(
  BarChart,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=429-821",
  {
    example: () => (
      <BarChart
        data={[
          { name: "Monday",    online: 14000, offline: 12000 },
          { name: "Tuesday",   online: 16000, offline: 11000 },
          { name: "Wednesday", online: 6000,  offline: 22000 },
          { name: "Thursday",  online: 15000, offline: 5000  },
          { name: "Friday",    online: 12000, offline: 11000 },
          { name: "Saturday",  online: 15000, offline: 13000 },
          { name: "Sunday",    online: 21000, offline: 10000 },
        ]}
        series={[
          { key: "online",  name: "Online Sales",  color: "#0095ff" },
          { key: "offline", name: "Offline Sales", color: "#00e096" },
        ]}
      />
    ),
  }
);
