export async function SearchItems(
  isMoveMap: boolean,
  map: any | null,
  draw: MapboxDraw | null,
  bounds: maplibregl.LngLatBounds | null,
  saleType: string,
  itemType: string,
  baseUrl: string,
  priceRange: [number, number | null],
  rentMaxPrice: number,
  buyMaxPrice: number,
  itemSort: string,
  selectedCountry: string,
  selectedState: string,
  selectedCity: string
) {
  let polygonArray: number[][];
  let minMaxLng: number[] | null = null;
  let poly: string;
  let poly2: string;
  let maxPrice: number;

  if (saleType === "rent") maxPrice = rentMaxPrice;
  else maxPrice = buyMaxPrice;

  if (priceRange[1] && priceRange[1] >= maxPrice) {
    priceRange[1] = 0;
  }

  if (bounds) {
    if (draw && draw.getAll().features[0]) {
      polygonArray =
        //@ts-ignore
        draw?.getAll()?.features[0]?.geometry.coordinates[0];
      //@ts-ignore
      const polygon = (await import("turf-polygon")).default;
      const intersect = (await import("@turf/intersect")).default;
      //@ts-ignore
      const featureCollection = (await import("turf-featurecollection"))
        .default;
      const selectedShape = polygon([polygonArray]);
      const mapBounds = polygon([getMapBounds(bounds, true)]);

      const intersection = intersect(
        featureCollection([selectedShape, mapBounds])
      );
      if (intersection) {
        const overlappingShape = intersection.geometry.coordinates;
        poly = turnArrayOfBoundsIntoString(overlappingShape[0] as number[][]);
      } else {
        poly = turnArrayOfBoundsIntoString(
          map.getZoom() >= 6
            ? getMapBounds(bounds, true)
            : getMapBounds(bounds, false)
        );
      }
      poly2 = "";
    } else {
      // Set polygonArray to the visible screen space
      polygonArray =
        map.getZoom() >= 6
          ? getMapBounds(bounds, true)
          : getMapBounds(bounds, false);
      minMaxLng = [0, 0];

      for (let i = 0; i < polygonArray.length; i++) {
        if (i === 0) minMaxLng = [polygonArray[i][0], polygonArray[i][0]];
        if (minMaxLng[0] > polygonArray[i][0])
          minMaxLng[0] = polygonArray[i][0];
        if (minMaxLng[1] < polygonArray[i][0])
          minMaxLng[1] = polygonArray[i][0];
      }

      const polyWidth = Math.abs(minMaxLng[0] - minMaxLng[1]);

      if (polyWidth > 180) {
        if (polyWidth > 220) {
          polygonArray = [];
          poly = "";
          poly2 = "";
        } else {
          const split = splitPolygon(getMapBounds(bounds, true));
          poly = split.poly;
          poly2 = split.poly2;
        }
      } else {
        poly2 = "";
        poly = turnArrayOfBoundsIntoString(polygonArray);
      }
    }
  } else {
    poly = "";
    poly2 = "";
  }

  const type = GetItemType(minMaxLng, itemType, saleType);

  try {
    const response = await fetch(
      `${baseUrl}/items?` +
        new URLSearchParams({
          type: type.toString(),
          min: priceRange[0].toString(),
          max: priceRange[1] ? priceRange[1].toString() : "",
          polygon: isMoveMap ? "" : poly,
          polygon2: isMoveMap ? "" : poly2,
          itemSort: itemSort,
          country: selectedCountry,
          state: selectedState,
          city: selectedCity,
        })
    ).then((res) => res.json());

    const responseData = response.data;
    if (responseData.length > 0) {
      let lowestPrice = responseData[0].EuroPrice;
      let highestPrice = responseData[0].EuroPrice;

      responseData.forEach((el: any) => {
        const euroPrice = el.EuroPrice;
        if (euroPrice < lowestPrice) lowestPrice = euroPrice;
        if (euroPrice > highestPrice) highestPrice = euroPrice;
      });

      const sourceObject = {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: responseData.map((marker: any) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [marker.Lng, marker.Lat],
            },
            properties: {
              lng: marker.Lng,
              lat: marker.Lat,
              size: marker.Size,
              originalPrice: marker.OriginalPrice,
              euroPrice: marker.EuroPrice,
              currencyCode: marker.CurrencyCode,
              currencySymbol: marker.CurrencySymbol,
              firstPicture: marker.FirstPicture,
              id: marker.Id,
              createdAt: marker.CreatedAt,
            },
          })),
        },
      };
      return {
        markers: sourceObject,
        propertyItems: responseData,
        lowestPrice,
        highestPrice,
      };
    }
  } catch (error) {
    console.error("Fetch request error:", error);
  }
}

function getMapBounds(bounds: maplibregl.LngLatBounds, get4Bounds: boolean) {
  if (get4Bounds) {
    return [
      [bounds._ne.lng, bounds._ne.lat],
      [bounds._sw.lng, bounds._ne.lat],
      [bounds._sw.lng, bounds._sw.lat],
      [bounds._ne.lng, bounds._sw.lat],
      [bounds._ne.lng, bounds._ne.lat],
    ];
  } else {
    const midPointTop = [(bounds._ne.lng + bounds._sw.lng) / 2, bounds._ne.lat];
    const midPointBottom = [
      (bounds._sw.lng + bounds._ne.lng) / 2,
      bounds._sw.lat,
    ];
    return [
      [bounds._ne.lng, bounds._ne.lat],
      midPointTop,
      [bounds._sw.lng, bounds._ne.lat],
      [bounds._sw.lng, bounds._sw.lat],
      midPointBottom,
      [bounds._ne.lng, bounds._sw.lat],
      [bounds._ne.lng, bounds._ne.lat],
    ];
  }
}

function splitPolygon(polygon: number[][]) {
  let midX = (polygon[0][0] + polygon[1][0]) / 2;
  let polygon1 = [
    [polygon[0][0], polygon[0][1]],
    [midX, polygon[1][1]],
    [midX, polygon[2][1]],
    [polygon[3][0], polygon[3][1]],
    [polygon[4][0], polygon[4][1]],
  ];
  let polygon2 = [
    [midX, polygon[0][1]],
    [polygon[1][0], polygon[1][1]],
    [polygon[2][0], polygon[2][1]],
    [midX, polygon[3][1]],
    [midX, polygon[4][1]],
  ];

  return {
    poly: turnArrayOfBoundsIntoString(polygon1),
    poly2: turnArrayOfBoundsIntoString(polygon2),
  };
}

export function GetItemType(
  minMaxLng: number[] | null,
  itemType: string,
  saleType: string
): number[] {
  let type: number[] = [0];
  if (itemType === "apartment") type = [1];
  else if (itemType === "house") type = [2];
  else if (itemType === "shared" || itemType === "land") type = [3];

  if (saleType === "buy") type[0] += 3;

  if (minMaxLng) {
    if (minMaxLng[0] >= 62)
      if (minMaxLng[1] < 180) type[0] += 12;
      else type = [type[0], type[0] + 6, type[0] + 12];
    else if (minMaxLng[0] >= -32)
      if (minMaxLng[1] < 62) type[0] += 6;
      else type = [type[0], type[0] + 6, type[0] + 12];
    else if (minMaxLng[0] >= -180)
      if (minMaxLng[1] < 62) type = [type[0], type[0] + 6];
      else type = [type[0], type[0] + 6, type[0] + 12];
  } else {
    type = [type[0], type[0] + 6, type[0] + 12];
  }
  return type;
}

export function turnArrayOfBoundsIntoString(arr: number[][]): string {
  let str = "";
  for (let i = 0; i < arr.length; i++) {
    str += `${arr[i][0]}_${arr[i][1]}${i < arr.length - 1 ? "," : ""}`;
  }
  return str;
}
