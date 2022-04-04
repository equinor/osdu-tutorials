import React, { useEffect } from "react";
import { Spin, Alert } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./styles.css";
import { WellSearchResponse } from "../../store/well/reducer";
import { Wellbore } from "../wellbore/wellbore";
import { useDispatch, useSelector } from "react-redux";
import { findWellboresAction } from "../../store/well/actions";
import { AppState } from "../../store";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { CircularProgress } from "@mui/material";

export interface FoundWellProps {
  /** a well model to be represented by the component */
  well: WellSearchResponse;
}

export function FoundWell({ well }: FoundWellProps) {
  const dispatch = useDispatch();
  const markClass = ["well__open-mark"].concat("well__open-mark--opened");

  useEffect(() => {
    dispatch(findWellboresAction(well.resourceId));
  }, [well]);

  const updatedWells = useSelector(
    (state: AppState) => state.wellSearch.foundWells
  );
  const wellbores = updatedWells.find(
    (i) => i.resourceId === well.resourceId
  )?.wellbores;

  const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <div className="well">
      <div className="well__label-container px-3">
        <label className="well__label">
          {/* despite a special responsive icon, the whole name is clickable */}
          {/* not to force a user into a pixel-hunting */}

          <div className="well__label-mark">
            <div className="well__label-mark">
              {/* an 'agle' icon, representing a drop-down behavior */}
              {/* it will be replaced with a load icon for the wellbores fetching process */}
              {well.areWellboresLoading ? (
                <Spin indicator={loadingIcon} />
              ) : (
                <span className={markClass.join(" ")} />
              )}
            </div>
          </div>
        </label>
        <Row className="welldetails">
          <Col md={2} className="fs-4">
            Well name
          </Col>
          <Col md={2} className="fs-4">
            {well.FacilityName}
          </Col>
          <Col md={6} className="fs-6">
            {well.resourceId}
          </Col>
        </Row>

        <Row className="welldetails">
          <Col>&nbsp;</Col>
        </Row>

        {/* <Row className="welldetails">
          <Col md={2} className="fs-4">
            {wellbores && wellbores?.length > 1 ? "Wellbores" : "Wellbore"}
            
          </Col>
        </Row> */}
        {wellbores?.length === 0 ? (
          <CircularProgress className="loader" />
        ) : (
          wellbores?.map((wb, index) => (
            <Row className="welldetails" key={wb.id}>
              <Col md={2} className="fs-4">
                {index === 0
                  ? wellbores && wellbores?.length > 1
                    ? "Wellbores"
                    : "Wellbore"
                  : null}
              </Col>
              <Wellbore key={wb.id} wellbore={wb} />
            </Row>
          ))
        )}
      </div>
      {/* a list of a well's wellbores, with a drop-down behavior */}
      {/* <ul className="well__trajectories-list">
        {wellbores?.map((wb) => (
          <Wellbore key={wb.id} wellbore={wb} />
        ))}
      </ul> */}

      {well.wellboresError && (
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
