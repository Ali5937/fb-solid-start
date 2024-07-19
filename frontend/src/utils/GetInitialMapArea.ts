import { turnArrayOfBoundsIntoString } from "./SearchItems";

function getStandardMapWidth(x: number) {
  const A = 263.671875;
  let B = 0.693147;
  if (x >= 5 && x < 12) B = normalize(x, 10, 20, 0.693147, 0.6);
  else if (x >= 12 && x < 15) B = normalize(x, 10, 20, 0.693147, 0.51);
  else if (x >= 15 && x < 19) B = normalize(x, 10, 20, 0.693147, 0.54);
  else if (x >= 19) return 0.01;

  return A * Math.exp(-B * x);
}

function normalize(
  value: number,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number
) {
  return ((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
}

export default function GetInitialMapArea(
  lng: number,
  lat: number,
  zoom: number
) {
  let distance = getStandardMapWidth(zoom);

  let zoomNum = (20 - zoom) / 20;
  zoomNum <= 0.01 && (zoomNum = 0.01);

  const newWidth = distance * zoomNum;
  const newHeight = distance * zoomNum;

  const halfWidth = newWidth / 2;
  const halfHeight = newHeight / 2;

  const topLeft = [lng - halfWidth, lat + halfHeight];
  const topRight = [lng + halfWidth, lat + halfHeight];
  const bottomLeft = [lng - halfWidth, lat - halfHeight];
  const bottomRight = [lng + halfWidth, lat - halfHeight];
  return turnArrayOfBoundsIntoString([
    topRight,
    bottomRight,
    bottomLeft,
    topLeft,
    topRight,
  ]);
}
