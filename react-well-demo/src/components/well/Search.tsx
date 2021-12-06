import React, { ChangeEvent, useState, FormEvent, useEffect } from 'react';
import { Spin, Alert } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import './styles.css';
import { FoundWell } from './FoundWell';
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../store";
import {findWellsByNameAction} from "../../store/well/actions";
import {loadWellboreTrajectoryAction} from "../../store/wellbore_trajectory/actions";

const noSearchHint = 'Results will be displayed here';
const noDataHint = 'No wells found';

export function Search() {
    const dispatch = useDispatch();

    const storedSearchName = useSelector((state: AppState) => state.wellSearch.searchName);
    const areWellsSearching = useSelector((state: AppState) => state.wellSearch.areWellsSearching);
    const areWellsSearched = useSelector((state: AppState) => state.wellSearch.areWellsSearched);
    const foundWells = useSelector((state: AppState) => state.wellSearch.foundWells);
    const searchError = useSelector((state: AppState) => state.wellSearch.searchError);

    const [searchName, setSearchName] = useState(storedSearchName);
    const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin/>;

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        // note, that this value does not sync with the store
        // store will be updated only on an actual search action
        setSearchName(event.target.value);
    };

    const handleSubmit = (event: FormEvent | MouseEvent) => {
        event.preventDefault();
        dispatch(findWellsByNameAction(searchName));
    };

    useEffect(() => {
        // without this update, value from the store used only once.
        // and never realy watched, creating an illusion of a coherent behavior
        setSearchName(storedSearchName);
    }, [storedSearchName]);

    return (
        <div className="search">
            {/* a search form at the top */}
            <form className="search__area" onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="search__text"
                    placeholder="Enter well name"
                    onChange={handleSearchChange}
                    value={searchName}
                />
                <input className="search__submit" type="submit" value="Search" onClick={handleSubmit} />
            </form>
            {/* a result representing area right under it */}
            <div className="search__well-area">
                {areWellsSearching ? (
                    // a progress, an anticipation
                    <Spin indicator={loadingIcon}/>
                ) : searchError ? (
                    // an error will be drawn here
                    <Alert
                        message="Cannot load well"
                        showIcon
                        description={String(searchError)}
                        type="error"
                    />
                ) : areWellsSearched ? (
                    // Successful search, two options now:
                    foundWells.length === 0 ? (
                        // nothing really found
                        // an honest descriptive message is much better that a blank space
                        <Alert message={noDataHint} type="warning" />
                    ) : (
                        // success, wells will be drawn
                        foundWells.map(well => (
                            <FoundWell
                                key={well.resourceId}
                                well={well}
                            />
                        ))
                    )
                ) : (
                    <Alert message={noSearchHint} type="success"/>
                )}
            </div>
        </div>
    );
}
