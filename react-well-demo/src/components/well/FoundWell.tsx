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
      <div className="well__label-container">
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
        <Row>
          <Col md={2}>Well name</Col>
          <Col>{well.FacilityName}</Col>
        </Row>
        <Row>
          <Col md={2}>
            {wellbores && wellbores?.length > 1 ? "Well bores" : "Well bore"}
            {/* Well bore{(wellbores && wellbores?.length > 1) ?? "s"} */}
          </Col>
        </Row>

        {wellbores?.map((wb) => (
          <Row>
            <Col>
              <Wellbore key={wb.id} wellbore={wb} />
            </Col>
          </Row>
        ))}
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
