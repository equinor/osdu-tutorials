import React, { FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import Intersection from "../../components/intersection/intersection";
import WellboreTrajectory from "../../components/wellboreTrajectory/WellboreTrajectory";
import { useTrajectories } from "../../hooks/useTrajectories";

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

  console.log(wellboreType, trajectories);

  return (
    <Box>
      <Intersection />
      <WellboreTrajectory trajectory={trajectories} />
    </Box>
  );
};

export default TrajectoryPage;
