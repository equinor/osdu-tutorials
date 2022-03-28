import React from "react";
import { AzureAD } from "react-aad-msal";
import { authProvider } from "./authProvider";
import store from "./store";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { MainPage } from "./pages/main/MainPage";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

function App() {
  return (
    <AzureAD provider={authProvider} forceLogin={true} reduxStore={store}>
      <Container>
        <Router>
          <Switch>
            <Route path="/" component={MainPage} exact />
          </Switch>
        </Router>
      </Container>
    </AzureAD>
  );
}

export default App;
