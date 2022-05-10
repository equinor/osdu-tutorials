import React, { FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import WellLog from "../../components/welllog";
import { useWellLog } from "../../hooks/useWelLog";

type WellLogParams = {
  fileGenericId: string;
};

const WellLogPage: FC = () => {
  const { fileGenericId } = useParams<WellLogParams>();
  const { fetchSignedUri, wellLogCurves } = useWellLog();

  useEffect(() => {
    if (fileGenericId) {
      fetchSignedUri(fileGenericId);
    }
  }, []);

  return <WellLog wellLogCurves={wellLogCurves} />;
};

export default WellLogPage;
