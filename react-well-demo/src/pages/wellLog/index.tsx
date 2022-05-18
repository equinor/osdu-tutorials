import { CircularProgress, Box } from "@mui/material";
import React, { FC, useEffect } from "react";
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

  useEffect(() => {
    if (fileGenericId) {
      fetchSignedUri(fileGenericId, fileExtension.toUpperCase());
    }
  }, [fileGenericId]);

  if (
    (!parquetWellLogCurves && !lasWellLogCurves) ||
    (parquetWellLogCurves.length === 0 && !lasWellLogCurves)
  ) {
    return <CircularProgress />;
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
          />
          <WellLog
            wellLogCurves={parquetWellLogCurves}
            curveTypes={Object.getOwnPropertyNames(parquetWellLogCurves[5])}
          />
        </>
      )}
      {lasWellLogCurves && (
        <p className="lasWellLogCurve">{lasWellLogCurves}</p>
      )}
    </Box>
  );
};

export default WellLogPage;
