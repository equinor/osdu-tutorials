import React from 'react';
import {AzureAD} from "react-aad-msal";
import {authProvider} from "./authProvider";
import store from "./store";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import {MainPage} from "./pages/main/MainPage";

function App() {
  return (
        <AzureAD provider={authProvider} forceLogin={true} reduxStore={store}>
            <Router>
                <Switch>
                    <Route path='/' component={MainPage} exact />
                </Switch>
            </Router>
        </AzureAD>
  );
}

export default App;
