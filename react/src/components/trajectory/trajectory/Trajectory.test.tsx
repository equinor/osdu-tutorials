import React from 'react';
import { shallow } from 'enzyme';
import { Trajectory, TrajectoryProps } from './Trajectory';
import { trajectoryFetchPointsSuccessState } from 'test-data/trajectory';

describe('Trajectory', () => {
  it('should render self and subcomponents', () => {
    const props: TrajectoryProps = {
      trajectoriesToDraw: trajectoryFetchPointsSuccessState.trajectories,
      className: 'test-class-name',
    };
    const wrapper = shallow(<Trajectory {...props} />);

    expect(wrapper).toMatchSnapshot();
  });
});
