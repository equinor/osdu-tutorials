import React from 'react';
import './styles.css';
import { Wellbore as WellboreModel } from 'store/well-search';
import { TrajectoryToDraw } from 'store/trajectory';
import { Loader } from 'components/shared';
import { TooltipPane } from 'components/shared/tooltip-pane';

export interface WellboreProps {
  /** a wellbore model to be represented by the component */
  wellbore: WellboreModel;

  /** trajectories to draw a visualize button in all its forms */
  selectedTrajectories: TrajectoryToDraw[];

  /** a toggle of a trajectory visualization */
  onSelected: (srn: string, selected: boolean) => void;
}

export function Wellbore({ wellbore, selectedTrajectories, onSelected }: WellboreProps) {
  console.log("wellog", wellbore)
  const trajectory = selectedTrajectories.find(st => st.wellboreId === wellbore.id);
  const toggleTrajectorySelected = () => {
    onSelected(wellbore.id, trajectory !== undefined);
  };

  return (
    <li className="wellbore">
      <span>{wellbore.id}</span>
      {/* an action-button/satus to the right to interact with trajectory 3D visualization feature */}
      <div className="wellbore__control">{getControl(trajectory, toggleTrajectorySelected)}</div>
    </li>
  );
}

/**
 * The so-called 'visualize-button' in fact has multiple variations
 * and they are groupped is this method not to bloat main component template
 * *maybe it's a sign to move the code to a separate file
 * @param trajectory a selected trajectory model - we need its state descriptors
 * @param toggleTrajectorySelected add/remove from a list to visualize the trajectory
 */
function getControl(
  trajectory: TrajectoryToDraw | undefined,
  toggleTrajectorySelected: () => void
) {
  if (!trajectory) {
    // a visualize button itself
    return (
      <div
        className="wellbore__action wellbore__action--visualize"
        onClick={toggleTrajectorySelected}>
        Visualize
      </div>
    );
  }

  if (trajectory.isLoading) {
    return <Loader size={8} />;
  }

  if (trajectory.loadError !== undefined) {
    // an error "state-button" will be displayed and a description available in a tooltip
    // an attached toggle action will allow to re-run fetch process
    return (
      <div className="wellbore__action wellbore__action--error" onClick={toggleTrajectorySelected}>
        Error
        <TooltipPane className="wellbore__action-tooltip" doApplyStylesForText={true}>
          {trajectory.loadError.message}
        </TooltipPane>
      </div>
    );
  }

  if (trajectory.isLoaded) {
    // a success "state-button", activation will hide trajectory's visualization
    return (
      <div className="wellbore__action wellbore__action--hide" onClick={toggleTrajectorySelected}>
        Hide
      </div>
    );
  }
  return null;
}
