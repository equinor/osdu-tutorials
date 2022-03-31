import React, { useEffect, useState } from "react";
import { Wellbore as WellboreModel } from "../../store/well/reducer";
import "./styles.css";
import Col from "react-bootstrap/Col";
import { Alert, Button, Snackbar, SnackbarOrigin } from "@mui/material";
import WellboreTrajectory from "../wellboreTrajectory/WellboreTrajectory";
import { useTrajectories } from "../../hooks/useTrajectories";

export interface WellboreProps {
  /** a wellbore_trajectory model to be represented by the component */
  wellbore: WellboreModel;
}

export interface AlertState extends SnackbarOrigin {
  open: boolean;
}

export function Wellbore({ wellbore }: WellboreProps) {
  const [displayTrajectory, setDisplayTrajectory] = useState<boolean>(false);
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
