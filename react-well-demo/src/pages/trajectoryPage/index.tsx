import React, { FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import Intersection from "../../components/intersection/intersection";
import { WellboreTrajectory } from "../../components/wellboreTrajectory/WellboreTrajectory";
import { useTrajectories } from "../../hooks/useTrajectories";

type WellboreParams = {
  wellboreId: string;
};

const TrajectoryPage: FC = () => {
  const { wellboreId } = useParams<WellboreParams>();
  const { fetchWellBoreId, wellboreType } = useTrajectories();

  useEffect(() => {
    fetchWellBoreId(wellboreId);
  }, [wellboreId]);

  console.log(wellboreType);

  return (
    <Box>
      <Intersection />
      <WellboreTrajectory />
    </Box>
  );
};

export default TrajectoryPage;
