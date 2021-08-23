import React from 'react';
import './styles.css';
import { Search } from 'components/well-search';
import { authProvider } from '../../authProvider';
import WellCanvas from "../../components/well-canvas/wellCanvas";
import { Trajectory } from 'components/trajectory';
import { TrajectoryToDraw } from 'store/trajectory'
import {useSelector} from "react-redux";
import {AppState} from "../../store";

/**
 * Contains login-logout functionality, search wells form,
 * found wells list and area for drawing well trajectories
 */
export function MainPage() {
  const { name } = authProvider.getAccount();

  const trajectories = useSelector((state: AppState) => state.trajectory.trajectories);
  const trajectoriesToDraw = trajectories.filter(t => t.isLoaded && t.loadError === undefined);
  const isTrajectoryLoading = trajectoriesToDraw.some(t => t.isLoading);

  const accountUi = () => {
    if (name === null) {
      return (
        <a
          className='auth-button'
          >
          Login
        </a>
      );
    } else {
      return (
        <>
          <span>Welcome {name}</span>
          <a className='auth-button' href={`/logout?frontend_state=${encodeURIComponent(window.location.href)}`}>
            Logout
          </a>
        </>
      );
    }
  };

  return (
    <div className='main'>
      <div className='main__page'>
        {/* wells search with results */}
        <Search />

        <div className="main__chart-area">
          {trajectoriesToDraw.length !== 0 ? (
              <Trajectory trajectoriesToDraw={trajectoriesToDraw} />
          ) : isTrajectoryLoading ? (
              <h1>loading</h1>
          ) : (
              <h1>No Trajectory to show</h1>
          )}
        </div>

        {/* map canvas */}
          <WellCanvas/>

        {/* login-logout functionality. plain and simple */}
        <div className='main__auth-buttons'>
          {accountUi()}
        </div>
      </div>
    </div>
  );
}
