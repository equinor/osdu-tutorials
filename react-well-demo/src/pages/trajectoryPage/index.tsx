import React, { FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { Map, Marker } from "pigeon-maps";
import Intersection from "../../components/intersection/intersection";
import { useTrajectories } from "../../hooks/useTrajectories";
import WellboreTrajectory from "../../components/wellboreTrajectory/WellboreTrajectory";

type WellboreParams = {
  wellboreId: string;
};

const TrajectoryPage: FC = () => {
  const { wellboreId } = useParams<WellboreParams>();
  const { fetchWellBoreId, wellboreType, fetchTrajectories, trajectories } =
    useTrajectories();

  useEffect(() => {
    fetchWellBoreId(wellboreId);
  }, [wellboreId]);

  useEffect(() => {
    if (wellboreType) {
      fetchTrajectories(wellboreType.results[0].id);
    }
  }, [wellboreType]);

  return (
    <Box>
      {/* {trajectories.length !== 0 ? (
        <Intersection trajectory={trajectories} />
      ) : null} */}
      {trajectories ? (
        <WellboreTrajectory trajectoryPoints={trajectories} />
      ) : null}
    </Box>
  );
};

export default TrajectoryPage;
