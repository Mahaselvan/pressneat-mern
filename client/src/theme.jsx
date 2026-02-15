import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      500: "#F97316", // modern orange
      600: "#EA580C",
      dark: "#0F172A"
    }
  },
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif"
  }
});

export default theme;
