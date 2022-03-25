import React, { useState, useEffect } from "react";
import { Map, Marker, Overlay } from "pigeon-maps";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "../../store";
import { WellSearchResponse } from "../../store/well/reducer";
import {
  findWellsByNameAction,
  findWellboresAction,
} from "../../store/well/actions";
import { FoundWell } from "./FoundWell";

const WellCanvas = () => {
  const [selectedWell, setSelectedWell] = useState<WellSearchResponse>(
    {} as WellSearchResponse
  );
  /*
run this here?
  dispatch(findWellsByNameAction(searchName));
  */
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(findWellsByNameAction(""));
  }, []);

  const foundWells = useSelector(
    (state: AppState) => state.wellSearch.foundWells
  );

  // useEffect(() => {
  //   dispatch(findWellboresAction(selectedWell.resourceId));
  // }, [selectedWell]);

  //   const dispatch = useDispatch();
  //   const wells = dispatch({ type: })

  if (foundWells.length == 0) {
    //return <></>;

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
  //console.log(xcenter + " " + ycenter);

  return (
    <div className="canvas">
      <div className="header">Well map</div>
      <Map height={400} center={[xcenter, ycenter]} zoom={11}>
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
      <div>
        {/* <div>
          {selectedWell.wellbores?.map((wb) => (
            <div key={wb.id}>{wb.id}</div>
          ))}
        </div> */}
        <FoundWell well={selectedWell} />
      </div>
    </div>
  );
};

export default WellCanvas;
