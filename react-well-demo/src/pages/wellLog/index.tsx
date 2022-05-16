import { CircularProgress, Box } from "@mui/material";
import React, { FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import CurveFilter from "../../components/curveFilter";
import WellLog from "../../components/welllog";
import { useWellLog } from "../../hooks/useWelLog";
import "./styles.css";

type WellLogParams = {
  fileGenericId: string;
};

const WellLogPage: FC = () => {
  const { fileGenericId } = useParams<WellLogParams>();
  const { fetchSignedUri, parquetWellLogCurves, lasWellLogCurves, error } =
    useWellLog();

  useEffect(() => {
    if (fileGenericId) {
      fetchSignedUri(fileGenericId);
    }
  }, []);

  if (!parquetWellLogCurves || (parquetWellLogCurves.length === 0 && !error)) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
      </div>
    );
  }

  const curveTypes = Object.getOwnPropertyNames(parquetWellLogCurves[5]);
  console.log(lasWellLogCurves);

  return (
    <Box height="100%">
      {parquetWellLogCurves && (
        <>
          <CurveFilter curveTypes={curveTypes} />
          <WellLog wellLogCurves={parquetWellLogCurves} />
        </>
      )}
      {lasWellLogCurves && lasWellLogCurves}
    </Box>
  );
};

export default WellLogPage;
