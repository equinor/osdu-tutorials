import React from 'react';
import './styles.css';

interface Props {
  // a font size. changes size of a componens as height and width are specified in "em"
  size?: number;
}

/**
 * super-duper animated bars will keep you amused
 * while little electrons rushes through cables under an ocean
 */
export function Loader({ size = 24 }: Props) {
  return (
    <div className="loader">
      <div className="loader__component" style={{ fontSize: size }}></div>
    </div>
  );
}
