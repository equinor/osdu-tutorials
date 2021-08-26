import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AzureAD } from 'react-aad-msal';
import { MainPage } from 'pages/main';
import { NotFoundPage } from 'pages/not-found';
import store from './store';
import { authProvider } from './authProvider';
import './App.css';

export const App = () => {
  return (
    <div className='App'>
      <AzureAD provider={authProvider} forceLogin={true} reduxStore={store}>
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
