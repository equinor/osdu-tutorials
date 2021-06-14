import React from 'react';
import './styles.css';
import { WellSearchResponse } from 'store/well-search';

export interface FoundWellProps {
  /** a well model to be represented by the component */
  well: WellSearchResponse;
}

export function FoundWell({
  well,
}: FoundWellProps) {
  const markClass = ['well__open-mark'].concat('well__open-mark--opened');

  return (
    <div className="well">
      <div className="well__label-container">
        <label className="well__label">
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
