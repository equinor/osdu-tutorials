import React from 'react';
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import {AzureAD} from "react-aad-msal";
import {NotFoundPage} from "./pages/not-found/NotFoundPage";
import './App.css';

import {authProvider} from "./authProvider";

function App() {
  return (
    <div className="App">
      <AzureAD provider={authProvider} forceLogin={true}>
          <Router>
              <Switch>
                  <Route path="*" component={NotFoundPage}></Route>
              </Switch>

          </Router>
      </AzureAD>
    </div>
  );
}

export default App;
