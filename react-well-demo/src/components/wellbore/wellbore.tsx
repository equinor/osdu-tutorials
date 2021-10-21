import React from 'react';
import { Wellbore as WellboreModel } from '../../store/well/reducer';

export interface WellboreProps {
    /** a wellbore model to be represented by the component */
    wellbore: WellboreModel;
}

export function Wellbore({ wellbore }: WellboreProps) {
    return (
        <li>
            <span>{wellbore.id}</span>
        </li>
    );
}
