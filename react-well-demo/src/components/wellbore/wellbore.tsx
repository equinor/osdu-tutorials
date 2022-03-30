import React from "react";
import { Wellbore as WellboreModel } from "../../store/well/reducer";
import "./styles.css";
import { useDispatch } from "react-redux";
import { loadWellboreTrajectoryAction } from "../../store/wellbore_trajectory/actions";
import { loadWellLogDataAction } from "../../store/welllog/actions";
import Col from "react-bootstrap/Col";

export interface WellboreProps {
  /** a wellbore_trajectory model to be represented by the component */
  wellbore: WellboreModel;
}

export function Wellbore({ wellbore }: WellboreProps) {
  const dispatch = useDispatch();

  function handleClick() {
    dispatch(loadWellboreTrajectoryAction(wellbore.id));
    dispatch(loadWellLogDataAction(wellbore.id));
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
    </>
  );
}
