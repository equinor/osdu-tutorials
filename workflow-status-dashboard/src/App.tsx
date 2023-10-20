import React, { FC } from "react";
import { AzureAD } from "react-aad-msal";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import { authProvider } from "./authProvider";

const App: FC = () => {
  return (
    <AzureAD provider={authProvider} forceLogin>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </Router>
    </AzureAD>
  );
};

export default App;
