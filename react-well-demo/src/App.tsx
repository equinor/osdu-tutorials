import React from 'react';
import {AzureAD} from "react-aad-msal";
import './App.css';
import {authProvider} from "./authProvider";
import store from "./store";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import {MainPage} from "./pages/main/MainPage";

function App() {
  return (
      <div className="App">
        <AzureAD provider={authProvider} forceLogin={true} reduxStore={store}>
            <Router>
                <Switch>
                    <Route path='/' component={MainPage} exact />
                </Switch>
            </Router>
        </AzureAD>
      </div>
  );
}

export default App;
