import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthenticationState, AzureAD, IAzureADFunctionProps } from 'react-aad-msal';
import { MainPage } from 'pages/main';
import { NotFoundPage } from 'pages/not-found';
import store from './store';
import { authProvider } from './authProvider';
import './App.css';

export const App = () => {
  return (
    <div className='App'>
      <AzureAD provider={authProvider} forceLogin={true} reduxStore={store}>
        {({
            authenticationState,
          }: IAzureADFunctionProps) => {
          if (authenticationState === AuthenticationState.Unauthenticated) {
            return (
              <>
                <h1>Please log in first.</h1>
              </>
            );
          }
        }}
        <Router>
            <Switch>
              <Route path='/' component={MainPage} exact />
              <Route path='*' component={NotFoundPage} />
            </Switch>
        </Router>
      </AzureAD>
    </div>
  );
};
