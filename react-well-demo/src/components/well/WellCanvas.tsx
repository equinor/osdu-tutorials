import React, { FC, useState, useEffect } from "react";
import { Map, Marker, Overlay } from "pigeon-maps";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "../../store";
import { WellSearchResponse } from "../../store/well/reducer";
import {
  findWellsByNameAction,
} from "../../store/well/actions";
import { FoundWell } from "./FoundWell";
import { Search } from "./Search";
import Account from '../account'
import {Box} from '@mui/material';

const WellCanvas: FC = () => {
  const [selectedWell, setSelectedWell] = useState<WellSearchResponse | undefined>();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(findWellsByNameAction(""));
  }, []);

  const foundWells = useSelector(
    (state: AppState) => state.wellSearch.foundWells
  );

  if (foundWells.length === 0) {

    const xcenter = 58.81955986060605; //somewhere Norwegian sea
    const ycenter = 2.5851197555555556;
    return (
      <div className="canvas">
        <div className="header">Well map empty</div>
        <Map
          height={400}
          defaultCenter={[xcenter, ycenter]}
          defaultZoom={7}
        ></Map>
      </div>
    );
  }

  const locations = foundWells.map((well) => well.location);
  const xcenter = locations.reduce((x, y) => x + y.lat, 0) / locations.length;
  const ycenter = locations.reduce((x, y) => x + y.lng, 0) / locations.length;

  return (
    <div className="canvas">
      <Map center={[xcenter, ycenter]} zoom={11}>
      <Box className="search-container">
        <Search />
        <Account />
      </Box>
        {foundWells.map((well) => (
          <Marker
            onClick={() => setSelectedWell(well)}
            key={well.resourceId}
            color={"red"}
            width={20}
            anchor={[well.location.lat, well.location.lng]}
          />
        ))}
        {selectedWell && (
          <Overlay
            anchor={[selectedWell?.location?.lat, selectedWell?.location?.lng]} offset={[25, 35]}
          > 
            <div className="highligh-circle"/>
          </Overlay>
        )}
      </Map>
      <div>
        {selectedWell && <FoundWell well={selectedWell} />}
      </div>
    </div>
  );
};

export default WellCanvas;
