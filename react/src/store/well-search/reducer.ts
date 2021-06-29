import {
  WellSearchActionTypes,
  FIND_WELLS_BY_NAME_START,
  FIND_WELLS_BY_NAME_FAIL,
  FIND_WELLS_BY_NAME_SUCCESS,
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

export interface WellSearchResponse {
  resourceId: string;

  /** a geo location, will be useful to reveal the well on the map */
  location: LatLng;
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
            )
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
    default:
      return state;
  }
};
