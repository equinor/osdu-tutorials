import React from 'react';
import { shallow } from 'enzyme';
import { Loader } from './Loader';

describe('Loader', () => {
  it('should render self and subcomponents', () => {
    const wrapper = shallow(<Loader />);

    expect(wrapper).toMatchSnapshot();
  });
});
