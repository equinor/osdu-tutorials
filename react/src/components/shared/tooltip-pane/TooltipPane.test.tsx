import React from 'react';
import { shallow } from 'enzyme';
import { TooltipPane } from './TooltipPane';

describe('Loader', () => {
  it('should render self and subcomponents', () => {
    const wrapper = shallow(<TooltipPane>text</TooltipPane>);

    expect(wrapper).toMatchSnapshot();
  });
});
