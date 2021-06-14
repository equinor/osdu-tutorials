import React from 'react';
import { shallow } from 'enzyme';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('should render self and subcomponents', () => {
    const wrapper = shallow(<NotFoundPage />);

    expect(wrapper).toMatchSnapshot();
  });
});
