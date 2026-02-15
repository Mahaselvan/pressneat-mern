import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import theme from "./theme";
ReactDOM.createRoot(document.getElementById("root")).render(
 <ChakraProvider theme={theme}>
  <AuthProvider>
    <App />
  </AuthProvider>
</ChakraProvider>
);
