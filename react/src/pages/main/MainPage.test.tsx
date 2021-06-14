import React from 'react';
import { shallow } from 'enzyme';
import { MainPage, MainPageProps } from './MainPage';

describe('MainPage', () => {
  it('should render self and subcomponents', () => {
    const props: MainPageProps = {
      isTrajectoryLoading: false,
      trajectoriesToDraw: [],
    };
    const wrapper = shallow(<MainPage {...props} />);

    expect(wrapper).toMatchSnapshot();
  });
});
