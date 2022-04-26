import React, { FC } from "react";
import { Box, Button } from "@mui/material";
import "./styles.css";
import { useWellLog } from "../../hooks/useWelLog";
import { useWellLogContext } from "../../contexts/wellLogContext/useWellLogContext";

const WellLogList: FC = () => {
  const { wellLogs } = useWellLog();
  const {setSelectedWellLog} = useWellLogContext();
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
          key={`wellLog__item__${wellLog.id}`}
          variant="contained"
          style={{ backgroundColor: "rgb(39, 77, 83)", marginBottom: "8px" }}
          onClick={() => setSelectedWellLog(wellLog.id)}
        >
          {wellLog.id}
        </Button>
      ))}
    </Box>
  );
};

export default WellLogList;
