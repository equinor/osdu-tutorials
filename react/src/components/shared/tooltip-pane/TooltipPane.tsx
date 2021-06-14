import React, { ReactNode } from 'react';
import './styles.css';

interface Props {
  /** a tooltip content */
  children: ReactNode;

  /** apply common set of styles for a one-two lines of text */
  doApplyStylesForText?: boolean;

  /** an additional class name */
  className?: string;
}

export function TooltipPane({ children, doApplyStylesForText = false, className }: Props) {
  const classNameList = ['tooltip-pane'];
  if (doApplyStylesForText) {
    classNameList.push('tooltip-pane--for-text');
  }
  if (className) {
    classNameList.push(className);
  }
  return <div className={classNameList.join(' ')}>{children}</div>;
}
