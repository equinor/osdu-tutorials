import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { AzureAD } from "react-aad-msal";
import { NotFoundPage } from "./pages/not-found/NotFoundPage";
import "./App.css";

import { authProvider } from "./authProvider";
import { MainPage } from "./pages/main/MainPage";
import store from "./store";

export const App = () => {
  return (
    <div className="App">
      <AzureAD provider={authProvider} forceLogin={true} reduxStore={store}>
        <Router>
          <Switch>
            <Route path="/" component={MainPage} exact />
            <Route path="*" component={NotFoundPage} />
          </Switch>
        </Router>
      </AzureAD>
    </div>
  );
};
