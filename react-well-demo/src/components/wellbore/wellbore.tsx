import React from 'react';
import { Wellbore as WellboreModel } from '../../store/well/reducer';
import "./styles.css"
import {useDispatch} from "react-redux";
import {loadWellboreTrajectoryAction} from "../../store/wellbore_trajectory/actions";
import {loadWellLogDataAction} from "../../store/welllog/actions";

export interface WellboreProps {
    /** a wellbore_trajectory model to be represented by the component */
    wellbore: WellboreModel;
}

export function Wellbore({ wellbore }: WellboreProps) {
    const dispatch = useDispatch();

    function handleClick() {
        dispatch(loadWellboreTrajectoryAction(wellbore.id));
        dispatch(loadWellLogDataAction(wellbore.id));
    }

    return (
        <li className="wellbore">
            <span onClick={handleClick}>{wellbore.id}</span>
            <div className="wellbore__control">
                <button className="wellbore__action--visualize" onClick={handleClick}>
                    Visualize
                </button>
            </div>
        </li>
    );
}
