import React, { useEffect, useState } from "react";
import { Wellbore as WellboreModel } from "../../store/well/reducer";
import "./styles.css";
import Col from "react-bootstrap/Col";
import { Alert, Button, Snackbar, SnackbarOrigin } from "@mui/material";
import WellboreTrajectory from "../wellboreTrajectory/WellboreTrajectory";
import { useTrajectories } from "../../hooks/useTrajectories";
import { useWellLogContext } from "../../contexts/wellLogContext/useWellLogContext";

export interface WellboreProps {
  /** a wellbore_trajectory model to be represented by the component */
  wellbore: WellboreModel;
}

export interface AlertState extends SnackbarOrigin {
  open: boolean;
}

export function Wellbore({ wellbore }: WellboreProps) {
  const { setSelectedWellboreId, setDisplayWellLogList, selectedWellboreId } =
    useWellLogContext();
  const [displayTrajectory, setDisplayTrajectory] = useState<boolean>(false);
  const [wellLogDisplay, setWellLogDisplay] = useState<boolean>(false);
  const [openAlert, setOpenAlert] = useState<AlertState>({
    open: false,
    vertical: "bottom",
    horizontal: "center",
  });
  const { open, vertical, horizontal } = openAlert;
  const { fetchWellBoreId, wellboreType, fetchTrajectories, trajectories } =
    useTrajectories();

  useEffect(() => {
    fetchWellBoreId(wellbore.id);
  }, [wellbore.id]);

  useEffect(() => {
    if (wellboreType?.results[0]?.id) {
      fetchTrajectories(wellboreType.results[0].id);
    }
  }, [wellboreType]);

  const handleCloseAlert = () => {
    setOpenAlert({ open: false, vertical, horizontal });
  };

  useEffect(() => {
    if (selectedWellboreId !== wellbore.id) {
      setWellLogDisplay(false);
    }
  }, [selectedWellboreId]);

  return (
    <>
      <Col md={2} className="fs-4">
        {wellbore.FacilityName}
      </Col>
      <Col md={6} className="fs-6">
        {wellbore.id}
      </Col>
      <Col>
        {displayTrajectory ? (
          <Button onClick={() => setDisplayTrajectory(false)}>
            Hide trajectories
          </Button>
        ) : (
          <Button onClick={() => setDisplayTrajectory(true)}>
            View trajectories
          </Button>
        )}
      </Col>
      {trajectories.length !== 0 && displayTrajectory && (
        <WellboreTrajectory trajectoryPoints={trajectories} />
      )}
      <Col>
        {wellLogDisplay ? (
          <Button
            onClick={() => {
              setDisplayWellLogList(false);
              setWellLogDisplay(false);
            }}
          >
            Hide well logs
          </Button>
        ) : (
          <Button
            onClick={() => {
              setDisplayWellLogList(true);
              setWellLogDisplay(true);
              setSelectedWellboreId(wellbore.id);
            }}
          >
            View well logs
          </Button>
        )}
      </Col>
      {trajectories.length === 0 && displayTrajectory && (
        <Snackbar
          open={true}
          autoHideDuration={500}
          onClose={handleCloseAlert}
          message="No trajectories available on wellbore"
          anchorOrigin={{ vertical, horizontal }}
        >
          <Alert severity="error">No trajectories available on wellbore</Alert>
        </Snackbar>
      )}
    </>
  );
}
