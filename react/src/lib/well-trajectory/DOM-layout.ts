export function createChartRootElement(): HTMLElement {
  const root = document.createElement('div');
  root.classList.add('trajectory-chart__layout');

  return root;
}
