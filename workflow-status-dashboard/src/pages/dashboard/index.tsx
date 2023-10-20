import React, { FC, useEffect } from "react";
import Status from "../../components/status/status";
import { useFunctionStatus } from "../../hooks/useFunctionStatus";
import "./styles.css";

const Dashboard: FC = () => {
  const {
    fetchSmdaStatus,
    smdaStatus,
    fetchDdmsCompositeWellogStatus,
    ddmsStatus,
  } = useFunctionStatus();

  useEffect(() => {
    fetchSmdaStatus();
    fetchDdmsCompositeWellogStatus();
  }, []);

  return (
    <div className="dashboard">
      <h1>Azure Function App - Status Dashboard</h1>
      <h4>SMDA ingestion Wellheaders</h4>
      <Status smdaStatus={smdaStatus.wellheaders} />
      <h4>SMDA Ingestion Fields</h4>
      <Status smdaStatus={smdaStatus.fields} />
      <h4>DDMS Composite Wellog Uploads</h4>
      <Status ddmsStatus={ddmsStatus.ddmsingestions} />
    </div>
  );
};

export default Dashboard;
