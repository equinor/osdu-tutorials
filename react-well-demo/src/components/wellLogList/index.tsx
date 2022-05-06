import React, { FC, useEffect } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import "./styles.css";
import { useWellLog } from "../../hooks/useWelLog";
import { useWellLogContext } from "../../contexts/wellLogContext/useWellLogContext";

const WellLogList: FC = () => {
  const { fileGenericIds, fetchFileGenericIds, fileGenericIdsLoading } =
    useWellLog();
  const { setSelectedWellLog, selectedWellboreId, displayWellLogList } =
    useWellLogContext();

  useEffect(() => {
    fetchFileGenericIds(selectedWellboreId);
  }, [selectedWellboreId]);

  if (!displayWellLogList) {
    return null;
  }

  return (
    <Box className="wellLog__list">
      <h4 className="list__header">Well Logs</h4>
      {fileGenericIds.length === 0 && <p>No well logs available</p>}
      {fileGenericIdsLoading ? (
        <CircularProgress />
      ) : (
        fileGenericIds.map((id) => (
          <Button
            key={`wellLog__item__${id}`}
            variant="contained"
            style={{ backgroundColor: "rgb(39, 77, 83)", marginBottom: "8px" }}
            onClick={() => setSelectedWellLog(id)}
          >
            {id}
          </Button>
        ))
      )}
    </Box>
  );
};

export default WellLogList;