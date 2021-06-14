import React from 'react';
import { shallow } from 'enzyme';
import { Hint, HintProps } from './Hint';

describe('Hint', () => {
  it('should render self and subcomponents', () => {
    const props: HintProps = {
      title: 'Test title',
      subTitle: 'Test subtitle',
    };
    const wrapper = shallow(<Hint {...props} />);

    expect(wrapper).toMatchSnapshot();
  });
});
