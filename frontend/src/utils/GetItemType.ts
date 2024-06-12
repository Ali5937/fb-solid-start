export default function TypeMinMax(
  saleType: string,
  itemType: string,
  polygon: string,
  polygon2: string
) {
  let type = [0];
  if (itemType === "apartment") type = [1];
  else if (itemType === "house") type = [2];
  else if (itemType === "shared" || itemType === "land") type = [3];

  if (saleType === "buy") type[0] += 3;

  let minMaxLng = [0, 0];

  const polygonArray = (polygon + "," + polygon2)
    .split(",")
    .map((el) => el.split("_").map(Number));

  for (let i = 0; i < polygonArray.length; i++) {
    if (i === 0) minMaxLng = [polygonArray[i][0], polygonArray[i][0]];
    if (minMaxLng[0] > polygonArray[i][0]) minMaxLng[0] = polygonArray[i][0];
    if (minMaxLng[1] < polygonArray[i][0]) minMaxLng[1] = polygonArray[i][0];
  }

  if (minMaxLng[0] >= 62)
    if (minMaxLng[1] < 180) type[0] += 12;
    else type = [type[0], type[0] + 6, type[0] + 12];
  else if (minMaxLng[0] >= -32)
    if (minMaxLng[1] < 62) type[0] += 6;
    else if (minMaxLng[1] < 180) type = [type[0] + 6, type[0] + 12];
    else type = [type[0], type[0] + 6, type[0] + 12];
  else if (minMaxLng[0] >= -180)
    if (minMaxLng[1] < 62) type = [type[0], type[0] + 6];
    else if (minMaxLng[1] < 180) type = [type[0], type[0] + 6, type[0] + 12];
    else type = [type[0], type[0] + 6, type[0] + 12];

  return type;
}
