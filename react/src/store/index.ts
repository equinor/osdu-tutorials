import { createStore, compose, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { wellSearchReducer, WellSearchState } from './well-search';
import { trajectoryReducer, TrajectoryState } from './trajectory';

export interface AppState {
  wellSearch: WellSearchState;
  trajectory: TrajectoryState;
}

// property should be declared to soothe typescript struggles
// @see https://stackoverflow.com/questions/52800877/has-anyone-came-across-this-error-in-ts-with-redux-dev-tools-property-redux
// @see https://stackoverflow.com/questions/12709074/how-do-you-explicitly-set-a-new-property-on-window-in-typescript
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: typeof compose;
  }
}
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const reducers = combineReducers<AppState>({
  wellSearch: wellSearchReducer,
  trajectory: trajectoryReducer,
});

const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)));

export default store;
