import React, { FC, useState, useEffect } from "react";
import { Map, Marker } from "pigeon-maps";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "../../store";
import { WellSearchResponse } from "../../store/well/reducer";
import { findWellsAction } from "../../store/well/actions";
import { FoundWell } from "./FoundWell";
import { CircularProgress } from "@mui/material";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Container } from "react-bootstrap";
import WellLogList from "../wellLogList";
// import WellLog from "../welllog";

type WellCanvasProps = {
  searchName: string;
};

const WellCanvas: FC<WellCanvasProps> = ({ searchName }) => {
  const dispatch = useDispatch();

  const [selectedWell, setSelectedWell] = useState<
    WellSearchResponse | undefined
  >();
  const [wellZoom, setWellZoom] = useState<boolean>(false);
  const [searchedWell, setSearchedWell] = useState<WellSearchResponse>(
    {} as WellSearchResponse
  );

  useEffect(() => {
    dispatch(findWellsAction());
  }, []);

  const foundWells = useSelector(
    (state: AppState) => state.wellSearch.foundWells
  );

  useEffect(() => {
    if (searchName) {
      const well = foundWells?.find((well) => well.FacilityName === searchName);
      if (well) {
        setSelectedWell(well);
        setSearchedWell(well);
        setWellZoom(true);
      }
    }
  }, [searchName]);

  if (foundWells.length === 0) {
    return <CircularProgress className="loader" />;
  }

  const locations = foundWells.map((well) => well.location);
  const xcenter = selectedWell
    ? searchedWell?.location?.lat
    : locations.reduce((x, y) => x + y.lat, 0) / locations.length;
  const ycenter = selectedWell
    ? searchedWell?.location?.lng
    : locations.reduce((x, y) => x + y.lng, 0) / locations.length;

  return (
    <div className="canvas">
      <Row className="h-80">
        <Col>
          <Map
            center={[xcenter, ycenter]}
            zoom={wellZoom ? 11 : undefined}
            defaultZoom={6}
          >
            {foundWells.map((well) => (
              <Marker
                onClick={() => setSelectedWell(well)}
                key={well.resourceId}
                color={
                  well.resourceId === selectedWell?.resourceId ? "green" : "red"
                }
                width={20}
                anchor={[well.location.lat, well.location.lng]}
                style={
                  well.resourceId === selectedWell?.resourceId
                    ? {
                        zIndex: 1,
                      }
                    : {}
                }
              />
            ))}
            <WellLogList />
          </Map>
        </Col>
      </Row>
      <Container fluid>
        <Row>
          <Col>
            <div>{selectedWell && <FoundWell well={selectedWell} />}</div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default WellCanvas;
