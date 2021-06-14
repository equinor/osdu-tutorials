import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'store';
import { findWellsByNameAction } from 'store/well-search';
import {
  unselectAllTrajectoriesAction,
} from 'store/trajectory';
import { Search } from './Search';

export function ConnectedSearch() {
  const dispatch = useDispatch();

  const storeSearchName = useSelector((state: AppState) => state.wellSearch.searchName);
  const areWellsSearching = useSelector((state: AppState) => state.wellSearch.areWellsSearching);
  const areWellsSearched = useSelector((state: AppState) => state.wellSearch.areWellsSearched);
  const foundWells = useSelector((state: AppState) => state.wellSearch.foundWells);
  const searchError = useSelector((state: AppState) => state.wellSearch.searchError);

  const handleSubmit = (searchName: string) => {
    dispatch(unselectAllTrajectoriesAction());
    dispatch(findWellsByNameAction(searchName));
  };

  console.log("found wells", foundWells)

  return (
    <Search
      onSubmit={handleSubmit}
      storedSearchName={storeSearchName}
      searchError={searchError}
      areWellsSearching={areWellsSearching}
      areWellsSearched={areWellsSearched}
      foundWells={foundWells}
    />
  );
}
