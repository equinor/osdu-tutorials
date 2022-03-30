import React from "react";
import { useHistory } from "react-router-dom";
import { Wellbore as WellboreModel } from "../../store/well/reducer";
import "./styles.css";
import { useDispatch } from "react-redux";
import { loadWellboreTrajectoryAction } from "../../store/wellbore_trajectory/actions";
import { loadWellLogDataAction } from "../../store/welllog/actions";
import Col from "react-bootstrap/Col";
import { Button } from "@mui/material";

export interface WellboreProps {
  /** a wellbore_trajectory model to be represented by the component */
  wellbore: WellboreModel;
}

export function Wellbore({ wellbore }: WellboreProps) {
  const dispatch = useDispatch();
  const history = useHistory();

  function handleClick() {
    // dispatch(loadWellboreTrajectoryAction(wellbore.id));
    // dispatch(loadWellLogDataAction(wellbore.id));
    history.push(`/trajectory/${wellbore.id}`);
  }
  return (
    <>
      {/* <span onClick={handleClick}>{wellbore.id}</span> */}

      <Col md={2} className="fs-4">
        {wellbore.FacilityName}
      </Col>
      <Col md={6} className="fs-6">
        {wellbore.id}
      </Col>
      <Col>
        <Button onClick={handleClick}>View trajectories</Button>
      </Col>
    </>
  );
}
