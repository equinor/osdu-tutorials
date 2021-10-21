import React, { useState } from 'react';
import { Spin, Alert } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import './styles.css';
import { WellSearchResponse } from '../../store/well/reducer';
import { Wellbore } from '../wellbore/wellbore';
import {useDispatch} from "react-redux";
import {findWellboresAction} from "../../store/well/actions";

export interface FoundWellProps {
    /** a well model to be represented by the component */
    well: WellSearchResponse;
}

export function FoundWell({
    well,
}: FoundWellProps) {
    const dispatch = useDispatch();

    const markClass = ['well__open-mark'].concat('well__open-mark--opened');
    const [opened, setOpened] = useState(false);

    const toggleWellbores = () => {
        if (
            !opened &&
            !well.areWellboresLoading &&
            (!well.areWellboresLoaded || well.wellboresError !== undefined)
        ) {
            dispatch(findWellboresAction(well.resourceId));
        }

        setOpened(!opened);
    };

    const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin/>;

    return (
        <div className="well">
            <div className="well__label-container">
                <label className="well__label" onClick={toggleWellbores}>
                    {/* despite a special responsive icon, the whole name is clickable */}
                    {/* not to force a user into a pixel-hunting */}

                    <div className="well__label-mark">
                        <div className="well__label-mark">
                            {/* an 'agle' icon, representing a drop-down behavior */}
                            {/* it will be replaced with a load icon for the wellbores fetching process */}
                            {well.areWellboresLoading ? (
                                <Spin indicator={loadingIcon}/>
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
                    />
                ))}
            </ul>

            {opened && well.wellboresError && (
                <Alert
                    message="Cannot load wellbore"
                    showIcon
                    description={String(well.wellboresError)}
                    type="error"
                />
            )}
        </div>
    );
}
