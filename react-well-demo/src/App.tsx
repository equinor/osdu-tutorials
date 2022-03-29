import { AzureAD } from "react-aad-msal";
import { authProvider } from "./authProvider";
import store from "./store";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { MainPage } from "./pages/main/MainPage";
import Container from "react-bootstrap/Container";

function App() {
  return (
    <AzureAD provider={authProvider} forceLogin={true} reduxStore={store}>
      <Container fluid className="h-100">
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
