import React from 'react';
import './styles.css';
import {WellboreTrajectory} from "../../components/wellboreTrajectory/WellboreTrajectory";
import WellLog from "../../components/welllog/welllog";
import WellCanvas from "../../components/well/WellCanvas";

/**
 * Contains login-logout functionality, search wells form,
 * found wells list and area for drawing well trajectories
 */
export function MainPage() {
    

    return (
        <div className='main'>
            <div className='main__page'>
                <WellCanvas/>
                <WellboreTrajectory/>
                <WellLog/>
            </div>
        </div>
    );
}
