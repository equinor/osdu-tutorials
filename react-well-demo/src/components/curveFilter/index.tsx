import React, { FC, useState } from "react";
import "./styles.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

type CurveFilterProps = {
  curveTypes: string[];
};

const CurveFilter: FC<CurveFilterProps> = ({ curveTypes }) => {
  const [displayAlternatives, setDisplayAlternatives] =
    useState<boolean>(false);
  const [tracksToDisplay, setTracksToDisplay] = useState<string[]>(
    curveTypes ?? []
  );

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
          {curveTypes.map((typeName) => (
            <label className="label" key={`curve__label__${typeName}`}>
              <input
                type="checkbox"
                defaultChecked={tracksToDisplay.includes(typeName)}
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
