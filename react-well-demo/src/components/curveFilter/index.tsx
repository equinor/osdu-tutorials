import React, { FC, useEffect, useState } from "react";
import "./styles.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

type CurveFilterProps = {
  curveTypes: string[];
  tracksToDisplay: string[];
  handleFilterChange: (track: string) => void;
  handleSetTracksToDisplay: (tracks: string[]) => void;
  handleSetDepthType: (depthType: string | null) => void;
};

const CurveFilter: FC<CurveFilterProps> = ({
  curveTypes,
  handleFilterChange,
  tracksToDisplay,
  handleSetTracksToDisplay,
  handleSetDepthType,
}) => {
  const [displayAlternatives, setDisplayAlternatives] =
    useState<boolean>(false);

  const filteredCurveTypes = curveTypes.filter(
    (type) => type !== "DEPTH" && type !== "TDEP" && type !== "DEPT"
  );

  useEffect(() => {
    if (tracksToDisplay.length === 0) {
      handleSetTracksToDisplay(filteredCurveTypes);
      if (curveTypes.includes("DEPTH")) {
        handleSetDepthType("DEPTH");
      } else if (curveTypes.includes("TDEP")) {
        handleSetDepthType("TDEP");
      } else if (curveTypes.includes("DEPT")) {
        handleSetDepthType("DEPT");
      } else if (curveTypes.length <= 1) {
        handleSetDepthType(null);
      }
    }
  }, []);

  return (
    <div className="filterContainer">
      <button
        className="tracksButton"
        onClick={() => setDisplayAlternatives(!displayAlternatives)}
      >
        Visible tracks
        <KeyboardArrowDownIcon />
      </button>
      {displayAlternatives && (
        <ul className="alternativeContainer">
          {filteredCurveTypes.map((typeName) => (
            <label className="label" key={`curve__label__${typeName}`}>
              <input
                className="checkbox"
                type="checkbox"
                defaultChecked={
                  tracksToDisplay.length === 0
                    ? filteredCurveTypes.includes(typeName)
                    : tracksToDisplay.includes(typeName)
                }
                onClick={() => handleFilterChange(typeName)}
              />
              {typeName}
            </label>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CurveFilter;
