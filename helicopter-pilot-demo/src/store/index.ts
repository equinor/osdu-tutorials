import {createStore, compose, combineReducers, applyMiddleware} from "redux";
import {scheduleLoadReducer, ScheduleLoadState} from "./schedule/reducer";
import thunk from "redux-thunk";
import {heliportLoadReducer, HeliportLoadState} from "./heliport/reducers";

export interface AppState {
    scheduleLoad: ScheduleLoadState,
    heliportLoad: HeliportLoadState
};

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
    scheduleLoad: scheduleLoadReducer,
    heliportLoad: heliportLoadReducer
});

const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)));

export default store;