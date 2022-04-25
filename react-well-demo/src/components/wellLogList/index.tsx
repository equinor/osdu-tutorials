import React, { FC } from "react";
import { Box, Button } from "@mui/material";
import { useWellLog } from "../../hooks/useWelLog";
import "./styles.css";

const WellLogList: FC = () => {
  const { wellLogs } = useWellLog();
  const logs = [
    {
      id: "oaktree-acorn:master-data--Wellbore:8d123fb0-9baa-11ec-9e01-367dda495db0",
    },
    {
      id: "oaktree-acorn:master-data--Wellbore:8d123fb0-9baa-11ec-9e01-367dda495db0",
    },
    {
      id: "oaktree-acorn:master-data--Wellbore:8d123fb0-9baa-11ec-9e01-367dda495db0",
    },
  ];

  return (
    <Box className="wellLog__list">
      <h4 className="list__header">Well Logs</h4>
      {logs.map((wellLog) => (
        <Button
          variant="contained"
          style={{ backgroundColor: "rgb(39, 77, 83)", marginBottom: "8px" }}
        >
          {wellLog.id}
        </Button>
      ))}
    </Box>
  );
};

export default WellLogList;
