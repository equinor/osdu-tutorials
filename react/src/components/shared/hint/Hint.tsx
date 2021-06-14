import React from 'react';
import './styles.css';

/**
 * An interface of the props Hint React component
 * @param {string} title - hint main text
 * @param {string} subTitle - hint additional text
 */
export interface HintProps {
  /** upper text, bigger font size  */
  title?: string;

  /** lower text, smaller font size */
  subTitle?: string;

  /** a small size for a more compact view  */
  size?: 'normal' | 'small';
}

/**
 * Create simple hint
 * @param {HintProps} props
 */
export function Hint({ title, subTitle, size = 'normal' }: HintProps) {
  return (
    <div className={`hint hint--size_${size}`}>
      <div className="hint__text hint__title">{title}</div>
      <div className="hint__text hint__sub-title">{subTitle}</div>
    </div>
  );
}
