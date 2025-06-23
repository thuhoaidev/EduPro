import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "antd/dist/reset.css";
import { AuthContext } from "./contexts/AuthContext.tsx";

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
    <AuthContext.Provider value={{ authToken: 'your-token-here' }}>
      <App />
      </AuthContext.Provider>
    </BrowserRouter>
  </QueryClientProvider>
);