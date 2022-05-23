import React, { FC, useEffect } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import "./styles.css";
import { useWellLog } from "../../hooks/useWelLog";
import { useWellLogContext } from "../../contexts/wellLogContext/useWellLogContext";
import { Link } from "react-router-dom";

const WellLogList: FC = () => {
  const { fileGenerics, fetchFileGenericIds, fileGenericIdsLoading } =
    useWellLog();
  const { selectedWellboreId, displayWellLogList } = useWellLogContext();

  useEffect(() => {
    fetchFileGenericIds(selectedWellboreId);
  }, [selectedWellboreId]);

  if (!displayWellLogList) {
    return null;
  }

  return (
    <Box className="list__container">
      <h4 className="list__header">Well Logs</h4>
      {!fileGenericIdsLoading && fileGenerics.length === 0 && (
        <p>No well logs available</p>
      )}
      <Box className="wellLog__list">
        {fileGenericIdsLoading ? (
          <CircularProgress
            style={{ position: "absolute", right: "50%", top: "15%" }}
          />
        ) : (
          fileGenerics.map((fileGeneric) =>
            fileGeneric.extension === "DLIS" ? (
              <Button
                key={`wellLog__item__${fileGeneric.id}`}
                variant="contained"
                style={{
                  backgroundColor: "rgb(192,192,192)",
                  marginBottom: "8px",
                }}
                className="wellog__button"
              >
                <Link
                  to={`/wellog/${fileGeneric.extension?.toLowerCase()}/${
                    fileGeneric.id
                  }`}
                  target="_blank"
                  className="link"
                >
                  Wellog - {fileGeneric.extension}
                </Link>
              </Button>
            ) : (
              <Button
                key={`wellLog__item__${fileGeneric.id}`}
                variant="contained"
                style={{
                  backgroundColor: "rgb(39, 77, 83)",
                  marginBottom: "8px",
                }}
                className="wellog__button"
              >
                <Link
                  to={`/wellog/${fileGeneric.extension?.toLowerCase()}/${
                    fileGeneric.id
                  }`}
                  target="_blank"
                  className="link"
                >
                  Wellog - {fileGeneric.extension}
                </Link>
              </Button>
            )
          )
        )}
      </Box>
    </Box>
  );
};

export default WellLogList;
