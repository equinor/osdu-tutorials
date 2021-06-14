import React from 'react';
import { shallow } from 'enzyme';
import { FoundWell, FoundWellProps } from './FoundWell';
import { wellSearchWellsFindSuccessState } from 'test-data/well-search';
import { Wellbore } from '../wellbore';

describe('FoundWell', () => {
  it('should render self', () => {
    const props: FoundWellProps = {
      selectedTrajectories: [],
      well: wellSearchWellsFindSuccessState.foundWells[0],
      onLoadWellbores: jest.fn(),
      onFetchTrajectory: jest.fn(),
      onUnselectTrajectory: jest.fn(),
    };
    const wrapper = shallow(<FoundWell {...props} />);

    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find(Wellbore).length).toBe(props.well.wellbores.length);
  });
});
