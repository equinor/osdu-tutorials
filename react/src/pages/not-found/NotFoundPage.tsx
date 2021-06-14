import React from 'react';
import './styles.css';

/**
 * Show an empty page when url has not found
 */
export function NotFoundPage() {
  return (
    <div className="not-found">
      <h2>Sorry. The page you are looking for was not found...</h2>
    </div>
  );
}
