import React from 'react';
import { shallow } from 'enzyme';
import { Search, SearchProps } from './Search';

describe('Search', () => {
  it('should render self and subcomponents', () => {
    const props: SearchProps = {
      onSubmit: jest.fn(),
      storedSearchName: 'storeSearchName',
      onLoadWellbores: jest.fn(),
      onFetchTrajectory: jest.fn(),
      onUnselectTrajectory: jest.fn(),
      searchError: undefined,
      areWellsSearching: false,
      areWellsSearched: false,
      foundWells: [],
      selectedWell: '',
      selectedTrajectories: [],
    };
    const wrapper = shallow(<Search {...props} />);

    expect(wrapper).toMatchSnapshot();
  });
});
