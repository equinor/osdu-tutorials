import { CircularProgress } from "@mui/material";
import React, { FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import WellLog from "../../components/welllog";
import { useWellLog } from "../../hooks/useWelLog";
import "./styles.css";

type WellLogParams = {
  fileGenericId: string;
};

const WellLogPage: FC = () => {
  const { fileGenericId } = useParams<WellLogParams>();
  const { fetchSignedUri, wellLogCurves, error } = useWellLog();

  useEffect(() => {
    if (fileGenericId) {
      fetchSignedUri(fileGenericId);
    }
  }, []);

  if (!wellLogCurves || (wellLogCurves.length === 0 && !error)) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
      </div>
    );
  }
  return <WellLog wellLogCurves={wellLogCurves} />;
};

export default WellLogPage;
