import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
ReactDOM.createRoot(document.getElementById("root")).render(
 <ChakraProvider value={defaultSystem}>
  <AuthProvider>
    <App />
  </AuthProvider>
</ChakraProvider>
);
