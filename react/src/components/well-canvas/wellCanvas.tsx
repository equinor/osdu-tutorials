import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import {LatLng} from "leaflet";
import {useSelector} from "react-redux";
import {AppState} from "../../store";
import {Hint} from "../shared";

const WellCanvas = () => {
    const foundWells = useSelector((state: AppState) => state.wellSearch.foundWells);
    //const center = new LatLng(51, 0.89);

    const locations = foundWells.map(well => well.location);

    const getCentroid = function (arr: LatLng[]) {
        return arr.reduce((x, y) => (x + y.lat), 0);
    }

    if (foundWells.length == 0) {
        return (<></>);
    }
    const xcenter = locations.reduce((x, y) => x + y.lat, 0) / locations.length;
    const ycenter = locations.reduce((x, y) => x + y.lng, 0) / locations.length;
    const center = new LatLng(xcenter, ycenter);
    console.log(center);

    return (
        <MapContainer center={center} zoom={8} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {
                foundWells.length == 0 ? (
                    <Hint subTitle="No well found"/>
                    ): (
                foundWells.map( well =>
                    <Marker key={well.resourceId} position={new LatLng(well.location.lat, well.location.lng)}>
                        <Popup>
                            A pretty CSS3 popup. <br/> Easily customizable.
                        </Popup>
                    </Marker>
                )
                )
            }
        </MapContainer>
    );
}

export default WellCanvas;