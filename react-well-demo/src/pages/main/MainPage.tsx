import React from 'react';
import {Container, Row, Col} from "react-grid-system";
import './styles.css';
import {authProvider} from '../../authProvider';
import {Search} from "../../components/well/Search";
//import MyComponent from "../../components/intersection/intersection"
import {WellboreTrajectory} from "../../components/wellboreTrajectory/WellboreTrajectory";
import Welllog from "../../components/welllog/welllog";
import WellCanvas from "../../components/well/WellCanvas";
import {Wellbore} from "../../components/wellbore/wellbore";

/**
 * Contains login-logout functionality, search wells form,
 * found wells list and area for drawing well trajectories
 */
export function MainPage() {
    const {name} = authProvider.getAccount();

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
                    <a className='auth-button'
                       href={`/logout?frontend_state=${encodeURIComponent(window.location.href)}`}>
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
                <Search/>

                <WellCanvas/>
                <WellboreTrajectory/>

                {/* login-logout functionality. plain and simple */}
                <div className='main__auth-buttons'>
                    {accountUi()}
                </div>
            </div>
        </div>
    );
}
