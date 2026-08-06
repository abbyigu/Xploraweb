// Distinct, high-contrast colours, one per neighbourhood. Cycles if more
// neighbourhoods exist than swatches, so new additions always get a colour.
export const NEIGHBOURHOOD_COLOR_PALETTE = [
  '#12343B', '#E07A5F', '#3D8B8B', '#B08968', '#5B6C9E',
  '#C9A227', '#7B4B94', '#2E7D32', '#C1447E', '#4A6741',
];

export function neighbourhoodColor(index: number): string {
  return NEIGHBOURHOOD_COLOR_PALETTE[index % NEIGHBOURHOOD_COLOR_PALETTE.length];
}
