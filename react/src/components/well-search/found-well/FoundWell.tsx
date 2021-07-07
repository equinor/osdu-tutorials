import React, { useState } from 'react';
import './styles.css';
import { WellSearchResponse } from 'store/well-search';
import { Hint, Loader } from '../../shared';
import { Wellbore } from '../wellbore';
import { TrajectoryToDraw } from '../../../store/trajectory';

export interface FoundWellProps {
  /** a well model to be represented by the component */
  well: WellSearchResponse;

  /** a user requests to load wellbores for a given well to look at them */
  onLoadWellbores: (wellId: string) => void;

  /** a user's request to load trajectory data to visualize it */
  onFetchTrajectory: (wellId: string, wellboreId: string) => void;

  /**
   * trajectories that came from an another store
   * and so are not awaited as part of a well model
   * they will be used to draw a visualize button in all its forms
   */
  selectedTrajectories: TrajectoryToDraw[];

  /** a user's decree that she is done with the trajectory's visualization */
  onUnselectTrajectory: (wellboreId: string) => void;
}

export function FoundWell({
  well,
  onLoadWellbores,
  selectedTrajectories,
  onUnselectTrajectory,
  onFetchTrajectory,
}: FoundWellProps) {
  const markClass = ['well__open-mark'].concat('well__open-mark--opened');
  const [opened, setOpened] = useState(false);

  const toggleTrajectories = () => {
    // we will load wellbores only once
    if (
      !opened &&
      !well.areWellboresLoading &&
      (!well.areWellboresLoaded || well.wellboresError !== undefined)
    ) {
      onLoadWellbores(well.resourceId);
    }

    setOpened(!opened);
    console.log(opened)
  };

  const toggleTrajectorySelected = (wellboreId: string, selected: boolean) => {
    if (selected) {
      onUnselectTrajectory(wellboreId);
    } else {
      onFetchTrajectory(well.resourceId, wellboreId);
    }
  };

  return (
    <div className="well">
      <div className="well__label-container">
        <label className="well__label" onClick={toggleTrajectories}>
          {/* despite a special responsive icon, the whole name is clickable */}
          {/* not to force a user into a pixel-hunting */}

          <div className="well__label-mark">
            <div className="well__label-mark">
              {/* an 'agle' icon, representing a drop-down behavior */}
              {/* it will be replaced with a load icon for the wellbores fetching process */}
              {well.areWellboresLoading ? (
                <Loader size={8} />
              ) : (
                <span className={markClass.join(' ')} />
              )}
            </div>
          </div>
          <span>{well.resourceId}</span>
        </label>
      </div>
      {/* a list of a well's wellbores, with a drop-down behavior */}
      <ul className="well__trajectories-list">
        {opened &&
        well.wellbores.map(wb => (
          <Wellbore
            key={wb.id}
            wellbore={wb}
            selectedTrajectories={selectedTrajectories}
            onSelected={toggleTrajectorySelected}
          />
        ))}
      </ul>

      {opened && well.wellboresError && (
        <Hint title='Cannot load wellbores' subTitle={String(well.wellboresError)} size="small" />
      )}
    </div>
  );
}
