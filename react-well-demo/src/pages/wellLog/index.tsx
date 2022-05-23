import { CircularProgress, Box } from "@mui/material";
import React, { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CurveFilter from "../../components/curveFilter";
import WellLog from "../../components/welllog";
import { useWellLog } from "../../hooks/useWelLog";
import "./styles.css";

type WellLogParams = {
  fileGenericId: string;
  fileExtension: string;
};

const WellLogPage: FC = () => {
  const { fileGenericId, fileExtension } = useParams<WellLogParams>();
  const { fetchSignedUri, parquetWellLogCurves, lasWellLogCurves, error } =
    useWellLog();

  const [tracksToDisplay, setTracksToDisplay] = useState<string[]>([]);
  const [depthType, setDepthType] = useState<string | null>("");

  const handleFilterChange = (curveType: string) => {
    if (tracksToDisplay.includes(curveType)) {
      setTracksToDisplay((prev) => {
        let updatedTypes = prev.filter((type) => type !== curveType);
        return [...updatedTypes];
      });
    } else {
      setTracksToDisplay((prev) => {
        return [...prev, curveType];
      });
    }
  };

  const handleSetTracksToDisplay = (tracks: string[]) => {
    setTracksToDisplay(tracks);
  };

  const handleSetDepthType = (depthType: string | null) => {
    setDepthType(depthType);
  };

  useEffect(() => {
    if (fileGenericId) {
      fetchSignedUri(fileGenericId, fileExtension.toUpperCase());
    }
  }, [fileGenericId]);

  if (
    (!parquetWellLogCurves && !lasWellLogCurves) ||
    (parquetWellLogCurves.length === 0 && !lasWellLogCurves)
  ) {
    return (
      <CircularProgress
        style={{ position: "absolute", right: "50%", top: "40%" }}
      />
    );
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <Box height="100%">
      {parquetWellLogCurves[5] && (
        <>
          <CurveFilter
            curveTypes={Object.getOwnPropertyNames(parquetWellLogCurves[5])}
            tracksToDisplay={tracksToDisplay}
            handleFilterChange={handleFilterChange}
            handleSetTracksToDisplay={handleSetTracksToDisplay}
            handleSetDepthType={handleSetDepthType}
          />
          {depthType && (
            <WellLog
              wellLogCurves={parquetWellLogCurves}
              curveTypes={tracksToDisplay}
              depthType={depthType}
            />
          )}
        </>
      )}
      {lasWellLogCurves && (
        <p className="lasWellLogCurve">{lasWellLogCurves}</p>
      )}
    </Box>
  );
};

export default WellLogPage;
