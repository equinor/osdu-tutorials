import React, { useState } from 'react';
import './styles.css';
import { WellSearchResponse } from 'store/well-search';

export interface FoundWellProps {
  /** a well model to be represented by the component */
  well: WellSearchResponse;

  /** a user requests to load wellbores for a given well to look at them */
  onLoadWellbores: (wellId: string) => void;
}

export function FoundWell({
  well,
  onLoadWellbores,
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
  };

  return (
    <div className="well">
      <div className="well__label-container">
        <label className="well__label" onClick={toggleTrajectories}>
          {/* despite a special responsive icon, the whole name is clickable */}
          {/* not to force a user into a pixel-hunting */}

          <div className="well__label-mark">
            {/* an 'agle' icon, representing a drop-down behavior */}
            {/* it will be replaced with a load icon for the wellbores fetching process */}
            {(
                <span className={markClass.join(' ')} />
            )}
          </div>

          <span>{well.resourceId}</span>
        </label>
      </div>
    </div>
  );
}
