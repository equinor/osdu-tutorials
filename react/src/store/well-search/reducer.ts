import {
  WellSearchActionTypes,
  FIND_WELLS_BY_NAME_START,
  FIND_WELLS_BY_NAME_FAIL,
  FIND_WELLS_BY_NAME_SUCCESS, FIND_WELLBORES_START, FIND_WELLBORES_SUCCESS, FIND_WELLBORES_FAIL,
} from './types';
import { GeoJSON, LatLng } from 'leaflet';

export interface WellSearchState {
  /** initial or last searched name. */
  searchName: string;

  /** well search api request progress flag */
  areWellsSearching: boolean;

  /** proof that a search request was made */
  areWellsSearched: boolean;

  /** any error, occured during a search request */
  searchError?: Error;

  /** a resulted list of wells after a successful rearch request */
  foundWells: WellSearchResponse[];
}

const initialState: WellSearchState = {
  searchName: 'BIR',
  areWellsSearching: false,
  areWellsSearched: false,
  foundWells: [],
  searchError: undefined,
};

export interface Wellbore {
  id: string;
}

export interface WellSearchResponse {
  resourceId: string;

  /** a geo location, will be useful to reveal the well on the map */
  location: LatLng;

  /** wellbores fetch api request progress flag */
  areWellboresLoading: boolean;

  /** proof that a wellbores fetch request was made */
  areWellboresLoaded: boolean;

  /** any error, occured during a wellbores fetch request */
  wellboresError?: Error;

  /** a list of wellbores fetched from the backend for a certain well */
  wellbores: Wellbore[];
}

export const wellSearchReducer = (
  state: WellSearchState = initialState,
  action: WellSearchActionTypes
): WellSearchState => {
  switch (action.type) {
    case FIND_WELLS_BY_NAME_START:
      return {
        ...state,
        searchName: action.payload,
        areWellsSearching: true,
        areWellsSearched: false,
        searchError: undefined,
      };
    case FIND_WELLS_BY_NAME_SUCCESS:
      return {
        ...state,
        areWellsSearching: false,
        areWellsSearched: true,
        foundWells: action.payload.results.map(
          (well): WellSearchResponse => ({
            resourceId: well.id,
            location: new LatLng(
              well.data['SpatialLocation.Wgs84Coordinates'].geometries[0].coordinates[1],
              well.data['SpatialLocation.Wgs84Coordinates'].geometries[0].coordinates[0]
            ),
            areWellboresLoading: false,
            areWellboresLoaded: false,
            wellbores: [],
            wellboresError: undefined,
          })
        ),
      };
    case FIND_WELLS_BY_NAME_FAIL:
      return {
        ...state,
        areWellsSearching: false,
        areWellsSearched: true,
        searchError: action.payload,
      };
    case FIND_WELLBORES_START:
      return {
        ...state,
        foundWells: state.foundWells.map(w => {
          return action.payload.includes(w.resourceId)
            ? {
              ...w,
              wellbores: [],
              areWellboresLoading: true,
              areWellboresLoaded: false,
              wellboresError: undefined,
            }
            : w;
        }),
      };
    case FIND_WELLBORES_SUCCESS:
      return {
        ...state,
        foundWells: state.foundWells.map(w => {
          return w.resourceId === action.payload.wellId
            ? {
              ...w,
              wellbores: action.payload.result.results.map(
                (d): Wellbore => ({
                  id: d.id,
                })
              ),
              areWellboresLoading: false,
              areWellboresLoaded: true,
            }
            : w;
        }),
      };
    case FIND_WELLBORES_FAIL:
      return {
        ...state,
        foundWells: state.foundWells.map(w => {
          return action.payload.wellId === w.resourceId
            ? {
              ...w,
              areWellboresLoading: false,
              areWellboresLoaded: true,
              wellboresError: action.payload.err,
            }
            : w;
        }),
      };
    default:
      return state;
  }
};
