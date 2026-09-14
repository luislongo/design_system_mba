import figma from "@figma/code-connect";
import { SearchInput } from "./SearchInput";

figma.connect(
  SearchInput,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=136-519",
  {
    props: {
      open: figma.enum("Open", {
        True: true,
        False: false,
      }),
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      placeholder: figma.string("Placeholder"),
    },
    example: ({ open, disabled, placeholder }) => (
      <SearchInput open={open} disabled={disabled} placeholder={placeholder} />
    ),
  }
);
