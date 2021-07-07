import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'store';
import { findWellsByNameAction, findWellboresAction } from 'store/well-search';
import {
  fetchTrajectoryPointsAction,
  unselectAllTrajectoriesAction,
  unselectTrajectoryAction,
} from 'store/trajectory';
import { Search } from './Search';

export function ConnectedSearch() {
  const dispatch = useDispatch();

  const storeSearchName = useSelector((state: AppState) => state.wellSearch.searchName);
  const areWellsSearching = useSelector((state: AppState) => state.wellSearch.areWellsSearching);
  const areWellsSearched = useSelector((state: AppState) => state.wellSearch.areWellsSearched);
  const foundWells = useSelector((state: AppState) => state.wellSearch.foundWells);
  const selectedWell = useSelector((state: AppState) => state.trajectory.wellId);
  const searchError = useSelector((state: AppState) => state.wellSearch.searchError);
  const selectedTrajectories = useSelector((state: AppState) => state.trajectory.trajectories);

  const handleSubmit = (searchName: string) => {
    dispatch(unselectAllTrajectoriesAction());
    dispatch(findWellsByNameAction(searchName));
  };

  const handleLoadWellbores = (wellId: string) => {
    dispatch(findWellboresAction(wellId));
  };

  const handleUnselectTrajectory = (wellboreId: string) => {
    dispatch(unselectTrajectoryAction(wellboreId));
  };
  const handleFetchTrajectoryPoints = (wellId: string, wellboreId: string) => {
    dispatch(fetchTrajectoryPointsAction(wellId, wellboreId));
  };

  return (
    <Search
      onSubmit={handleSubmit}
      storedSearchName={storeSearchName}
      searchError={searchError}
      areWellsSearching={areWellsSearching}
      areWellsSearched={areWellsSearched}
      foundWells={foundWells}
      selectedWell={selectedWell}
      selectedTrajectories={selectedTrajectories}
      onLoadWellbores={handleLoadWellbores}
      onFetchTrajectory={handleFetchTrajectoryPoints}
      onUnselectTrajectory={handleUnselectTrajectory}
    />
  );
}
