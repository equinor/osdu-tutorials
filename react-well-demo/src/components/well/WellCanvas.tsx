import React, { useState, useEffect } from "react";
import { Map, Marker, Overlay } from "pigeon-maps";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "../../store";
import { WellSearchResponse } from "../../store/well/reducer";

const WellCanvas = () => {
  const [selectedWell, setSelectedWell] = useState<WellSearchResponse>(
    {} as WellSearchResponse
  );

  const foundWells = useSelector(
    (state: AppState) => state.wellSearch.foundWells
  );

  //   const dispatch = useDispatch();
  //   const wells = dispatch({ type: })

  if (foundWells.length == 0) {
    return <></>;
  }

  const locations = foundWells.map((well) => well.location);
  const xcenter = locations.reduce((x, y) => x + y.lat, 0) / locations.length;
  const ycenter = locations.reduce((x, y) => x + y.lng, 0) / locations.length;

  return (
    <div className="canvas">
      <div className="header">Well map</div>
      <Map height={400} defaultCenter={[xcenter, ycenter]} defaultZoom={11}>
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
            anchor={[selectedWell?.location?.lat, selectedWell?.location?.lng]}
          >
            <div>{selectedWell.FacilityName}</div>
          </Overlay>
        )}
      </Map>
    </div>
  );
};

export default WellCanvas;
