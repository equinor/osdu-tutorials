import React from "react";
import { Map, Marker } from "pigeon-maps"
import {useSelector} from "react-redux";
import {AppState} from "../../store";

const WellCanvas = () => {
    const foundWells = useSelector((state: AppState) => state.wellSearch.foundWells);

    if (foundWells.length == 0) {
        return (<></>);
    }

    const locations = foundWells.map(well => well.location);
    const xcenter = locations.reduce((x, y) => x + y.lat, 0) / locations.length;
    const ycenter = locations.reduce((x, y) => x + y.lng, 0) / locations.length;

    return (
        <Map height={500} defaultCenter={[xcenter, ycenter]} defaultZoom={11}>
            {
                foundWells.map(well => (
                    <Marker key={well.resourceId} color={"red"} width={20} anchor={[well.location.lat, well.location.lng]}/>
                ))
            }
        </Map>
    );
}

export default WellCanvas;