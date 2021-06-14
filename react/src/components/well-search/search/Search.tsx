import React, { ChangeEvent, useState, FormEvent, useEffect } from 'react';
import './styles.css';
import { Loader, Hint } from 'components/shared';
import { FoundWell } from '../found-well';
import { WellSearchResponse } from 'store/well-search';

export interface SearchProps {
  /**
   * a search value, stored in a redux state
   * though we will not update in on every input change,
   * we will keep an eye on it and make sure to use it if updated
   */
  storedSearchName: string;

  /** its text will be displayed instead of results list */
  searchError?: Error;

  /** flag to toggle an amazing loader */
  areWellsSearching: boolean;

  /**
   * with this knowledge we have an ability to inform a user that
   * the search itself was successful, just fruitless :)
   */
  areWellsSearched: boolean;

  /** we'll draw a cool list out of them */
  foundWells: WellSearchResponse[];

  /** search form submit */
  onSubmit: (name: string) => void;
}

const noSearchHint = 'Results will be displayed here';
const noDataHint = 'No wells found';
const cannotFindWellsMsg = 'Cannot find wells';

export function Search({
  onSubmit,
  storedSearchName,
  searchError,
  areWellsSearching,
  areWellsSearched,
  foundWells,
}: SearchProps) {
  const [searchName, setSearchName] = useState(storedSearchName);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    // note, that this value does not sync with the store
    // store will be updated only on an actual search action
    setSearchName(event.target.value);
  };

  const handleSubmit = (event: FormEvent | MouseEvent) => {
    event.preventDefault();
    onSubmit(searchName);
  };

  useEffect(() => {
    // without this update, value from the store used only once.
    // and never realy watched, creating an illusion of a coherent behavior
    setSearchName(storedSearchName);
  }, [storedSearchName]);

  return (
    <div className="search">
      {/* a search form at the top */}
      <form className="search__area" onSubmit={handleSubmit}>
        <input
          type="text"
          className="search__text"
          placeholder="Enter well name"
          onChange={handleSearchChange}
          value={searchName}
        />
        <input className="search__submit" type="submit" value="Search" onClick={handleSubmit} />
      </form>
      {/* a result representing area right under it */}
      <div className="search__well-area">
        {areWellsSearching ? (
          // a progress, an anticipation
          <Loader />
        ) : searchError ? (
          // an error will be drawn here
          <Hint title={cannotFindWellsMsg} subTitle={String(searchError)} />
        ) : areWellsSearched ? (
          // Successful search, two options now:
          foundWells.length === 0 ? (
            // nothing really found
            // an honest descriptive message is much better that a blank space
            <Hint subTitle={noDataHint} />
          ) : (
              // success, wells will be drawn
              foundWells.map(well => (
                <FoundWell
                  key={well.resourceId}
                  well={well}
                />
              ))
            )
        ) : (
                // it's a very beginning: nothing done right, nothing went wrong
                // a perfect time to give a hint ';..;'
                <Hint subTitle={noSearchHint} />
              )}
      </div>
    </div>
  );
}
