import React, { FC, useState, FormEvent } from "react";
import "./styles.css";
import { useSelector } from "react-redux";
import { AppState } from "../../store";
import { TextField, Autocomplete } from "@mui/material";

type SearchProps = {
  setSearchNameCallback: (searchName: string) => void;
};

const Search: FC<SearchProps> = ({ setSearchNameCallback }) => {
  const foundWells = useSelector(
    (state: AppState) => state.wellSearch.foundWells
  );

  const wellNames = foundWells.map((well) => well.FacilityName);

  const [searchName, setSearchName] = useState<string>("");

  const handleSubmit = (event: FormEvent | MouseEvent) => {
    event.preventDefault();
    setSearchNameCallback(searchName);
  };

  return (
    <div className="search">
      <form className="search__area" onSubmit={handleSubmit}>
        <Autocomplete
          sx={{ width: 300 }}
          options={wellNames}
          onChange={(_, v) => setSearchName(v ?? "")}
          renderInput={(params) => (
            <TextField
              {...params}
              type="text"
              className="search__text"
              placeholder="Enter well name"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchName(e?.target.value)
              }
              value={searchName}
            />
          )}
        />

        <input
          className="search__submit"
          type="submit"
          value="Search"
          onClick={handleSubmit}
        />
      </form>
    </div>
  );
};

export default Search;
