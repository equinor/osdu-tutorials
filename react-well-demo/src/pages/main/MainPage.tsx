import React from "react";
import "./styles.css";
import { WellboreTrajectory } from "../../components/wellboreTrajectory/WellboreTrajectory";
import WellLog from "../../components/welllog/welllog";
import WellCanvas from "../../components/well/WellCanvas";
import Search from "../../components/well/Search";
import Account from "../../components/account";
import { Box } from "@mui/material";

/**
 * Contains login-logout functionality, search wells form,
 * found wells list and area for drawing well trajectories
 */
export function MainPage() {
  return (
    <div className="main">
      <div className="main__page">
        <Box className="navbar">
          <Search />
          <Account />
        </Box>
        <WellCanvas />
        <WellboreTrajectory />
        <WellLog />
      </div>
    </div>
  );
}
