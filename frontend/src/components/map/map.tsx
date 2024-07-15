import {
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  untrack,
} from "solid-js";
import maplibregl from "maplibre-gl";
import IconPencil from "~/assets/icon-pencil";
import IconTrash from "~/assets/icon-trash";
import "./mapLibre.css";
import "./map.css";

let mapContainer: HTMLDivElement;
let map: maplibregl.Map;
export default function Map(props: any) {
  let draw: any; // type: MapboxGlDraw
  let drawParent: any;
  let pencilButton: any;
  let newPencilButton: any;
  let trashButton: any;
  let priceRange: string[] = [];
  let oldCoordinates: [number, number] = [0, 0];
  let coordinates: [number, number] = [0, 0];
  let poly: string = "";
  let poly2: string = "";
  let isPopupShown = false;
  let lowestPrice = 0;
  let highestPrice = 0;
  let mapMarkerColor = ["#FF3333", "#2624B3"];
  let minMaxLng = [0, 0];
  let locationLng = 0;
  let locationLat = 0;
  const [isMapLoaded, setIsMapLoaded] = createSignal(false);
  const [markers, setMarkers] = createSignal<any>();

  let markerImg = document.createElement("div");
  markerImg.setAttribute("class", "map-marker-symbol");
  let marker = new maplibregl.Marker({
    element: markerImg,
  }).setLngLat({
    lng: 0,
    lat: 0,
  });

  function removeOldPolys() {
    const newMode =
      draw.getAll().features[draw.getAll().features.length - 1]?.id;
    draw.getAll().features.forEach((feat: any) => {
      if (feat.id !== newMode) {
        draw.delete(feat.id);
        removeMarkers();
      }
    });
    removeMarkers();
  }

  async function clickPencil() {
    if (!draw) {
      await loadDraw();
    }
    draw.changeMode("draw_polygon");
    removeOldPolys();
  }

  function clickTrash() {
    draw?.deleteAll();
    removeMarkers();
    handleSearch(false);
    if (draw) draw.changeMode("simple_select");
  }

  function checkIfSelectedItemIsVisibleOnMap() {
    if (!props.selectedItem()) return;
    // console.time("test");
    let isVisible = false;
    props.propertyItems().forEach((pI: any) => {
      if (props.selectedItem().id === pI.id) isVisible = true;
    });
    if (!isVisible) props.setSelectedItem(null);
    // console.timeEnd("test");
  }

  async function handleSearch(isMoveMap: boolean) {
    // console.time("fetchTime");
    let polygonArray: number[][];
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
      const mapBounds = polygon([getMapBounds(true)]);

      const intersection = intersect(
        featureCollection([selectedShape, mapBounds])
      );
      if (intersection) {
        const overlappingShape = intersection.geometry.coordinates;
        poly = turnArrayOfBoundsIntoString(overlappingShape[0]);
      } else {
        poly = turnArrayOfBoundsIntoString(
          map.getZoom() >= 6 ? getMapBounds(true) : getMapBounds(false)
        );
      }
      poly2 = "";
    } else {
      //Set polygonArray to the visible screen space
      polygonArray =
        map.getZoom() >= 6 ? getMapBounds(true) : getMapBounds(false);
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
          splitPolygon(getMapBounds(true));
        }
      } else {
        poly2 = "";
        poly = turnArrayOfBoundsIntoString(polygonArray);
      }
    }

    setPriceRange();

    let type: number[] = [0];
    if (props.itemType() === "apartment") type = [1];
    else if (props.itemType() === "house") type = [2];
    else if (props.itemType() === "shared" || props.itemType() === "land")
      type = [3];

    if (props.saleType() === "buy") type[0] += 3;

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

    if (isMoveMap) type = [type[0], type[0] + 6, type[0] + 12];

    try {
      const response = await fetch(
        `${props.baseUrl}/items?` +
          new URLSearchParams({
            type: type.toString(),
            min: priceRange[0],
            max: priceRange[1],
            polygon: isMoveMap ? "" : poly,
            polygon2: isMoveMap ? "" : poly2,
            itemSort: props.itemSort(),
            country: props.selectedCountry(),
            state: props.selectedState(),
            city: props.selectedCity(),
          })
      );

      const responseData = await response.json();
      if (responseData.length > 0) {
        lowestPrice = responseData[0].euro_price;
        highestPrice = responseData[0].euro_price;

        responseData.forEach((el: any) => {
          const euroPrice = el.euro_price;
          if (euroPrice < lowestPrice) lowestPrice = euroPrice;
          if (euroPrice > highestPrice) highestPrice = euroPrice;
        });

        // locationLng = responseData[0].lng;
        // locationLat = responseData[0].lat;
        // console.log(locationLng, locationLat);

        const sourceObject = {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: responseData.map((marker: any) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [marker.lng, marker.lat],
              },
              properties: {
                lng: marker.lng,
                lat: marker.lat,
                size: marker.size,
                originalPrice: marker.original_price,
                euroPrice: marker.euro_price,
                currencyCode: marker.currency_code,
                currencySymbol: marker.currency_symbol,
                first_picture: marker.first_picture,
                id: marker.id,
                createdAt: marker.created_at,
              },
            })),
          },
        };

        setMarkers(sourceObject);
        props.setPropertyItems(responseData);
      }

      checkIfSelectedItemIsVisibleOnMap();
    } catch (error) {
      console.error("Fetch request error:", error);
    }
    // console.timeEnd("fetchTime");
  }

  function getMapBounds(get4Bounds: boolean) {
    const bounds = map.getBounds();
    if (get4Bounds) {
      return [
        [bounds._ne.lng, bounds._ne.lat],
        [bounds._sw.lng, bounds._ne.lat],
        [bounds._sw.lng, bounds._sw.lat],
        [bounds._ne.lng, bounds._sw.lat],
        [bounds._ne.lng, bounds._ne.lat],
      ];
    } else {
      const midPointTop = [
        (bounds._ne.lng + bounds._sw.lng) / 2,
        bounds._ne.lat,
      ];
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
    poly = turnArrayOfBoundsIntoString(polygon1);
    poly2 = turnArrayOfBoundsIntoString(polygon2);
  }

  function turnArrayOfBoundsIntoString(arr: any) {
    let str = "";
    for (let i = 0; i < arr.length; i++) {
      str += `${arr[i][0]}_${arr[i][1]}${i < arr.length - 1 ? "," : ""}`;
    }
    return str;
  }

  function loadMarkers() {
    const markerCount = markers().data.features.length;
    removeMarkers();
    map.addSource("marker-data", {
      type: "geojson",
      data: markers().data,
    });
    map.addLayer({
      id: "markers",
      type: "circle",
      source: "marker-data",
      paint: {
        "circle-radius": 10,
        "circle-color":
          markerCount > 1 && highestPrice > lowestPrice
            ? [
                "interpolate",
                ["linear"],
                ["get", "euroPrice"],
                lowestPrice,
                mapMarkerColor[1],
                highestPrice,
                mapMarkerColor[0],
              ]
            : mapMarkerColor[0],
        "circle-stroke-width": 1,
        "circle-stroke-color":
          props.theme() === "dark-theme" ? "white" : "black",
      },
    });
  }

  function removeMarkers() {
    if (map.getLayer("markers")) map.removeLayer("markers");
    if (map.getSource("marker-data")) map.removeSource("marker-data");
  }

  function setPriceRange() {
    priceRange =
      props.saleType() === "rent"
        ? props.rentPriceRange()
        : props.buyPriceRange();
  }

  async function loadDraw() {
    const MapboxDraw = (await import("@mapbox/mapbox-gl-draw")).default;
    const FreehandMode = (
      await import("../../local-modules/local-mapbox-gl-draw-freehand-mode/src")
    ).default;
    const { getDrawStyle } = await import("./drawStyles");

    marker.addTo(map);

    map.dragRotate.disable();
    map.touchZoomRotate.disable();
    map.keyboard.disableRotation();

    draw = new MapboxDraw({
      //@ts-ignore
      modes: Object.assign(MapboxDraw.modes, {
        draw_polygon: FreehandMode,
      }),
      displayControlsDefault: false,
      styles: getDrawStyle(props.theme()),
    });

    map.addControl(draw);
  }

  createEffect(() => {
    const mapLocation = untrack(() => props.mapLocation());
    map = new maplibregl.Map({
      container: mapContainer,
      style: `https://tiles.stadiamaps.com/styles/${
        props.theme() === "dark-theme" ? "alidade_smooth_dark" : "osm_bright"
      }.json`,
      center: [mapLocation[0], mapLocation[1]],
      zoom: mapLocation[2],
      minZoom: 1,
      maxZoom: 20,
      pitchWithRotate: false,
      dragRotate: false,
    });

    let popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    function showPopUp(e: any) {
      const euroPrice = e.features[0].properties.euroPrice;
      const originalPrice = Number(e.features[0].properties.originalPrice);
      const currencySymbol = props.currentCurrency()
        ? props.currentCurrency()[3]
        : e.features[0].properties.currencySymbol;
      const size =
        e.features[0].properties.size *
        (props.displayUnits() === "f" ? 10.76 : 1);
      const sizeSymbol =
        props.displayUnits() === "f" ? `ft<sup>2</sup>` : `m<sup>2</sup>`;
      const cityName = e.features[0].properties.city;
      coordinates = e.features[0].geometry.coordinates.slice();
      if (oldCoordinates[0] === coordinates[0] && isPopupShown) return;
      isPopupShown = true;
      oldCoordinates = coordinates;
      const firstPicture = e.features[0].properties.first_picture;
      popup
        .setLngLat(coordinates)
        .setHTML(
          `<div class="popup">
						<img class="popup-img" src="${firstPicture}" />
						<div class="popup-text">
							<div class="top">
								<div class="price">${`${
                  props.currentCurrency()
                    ? Math.round(
                        euroPrice * props.currentCurrency()[4]
                      ).toLocaleString()
                    : originalPrice.toLocaleString()
                } ${currencySymbol}`}</div>
								<div class="size">${`${Math.round(size)} ${sizeSymbol}`}</div>
							</div>
							<div class="city">${cityName ?? ""}</div>
						</div>
					</div>`
        )
        .addTo(map);
    }

    map.on("moveend", function () {
      const center = map.getCenter();
      const zoom = map.getZoom();
      props.setMapLocation([
        center.lng.toFixed(4),
        center.lat.toFixed(4),
        zoom.toFixed(1),
      ]);

      handleSearch(false);
    });

    map.on("draw.create", async function () {
      handleSearch(false);
    });

    map.on("mouseenter", "markers", function (e: any) {
      showPopUp(e);
    });

    map.on("mousemove", "markers", function (e: any) {
      showPopUp(e);
    });

    map.on("mouseleave", "markers", function () {
      popup.remove();
      isPopupShown = false;
    });

    map.on("click", "markers", function (e: any) {
      showPopUp(e);
      props.setSelectedItem(e.features[0].properties);
      props.setIsPanelOpen(true);
    });

    map.on("styledata", function () {
      setIsMapLoaded(true);
    });

    onCleanup(() => {
      if (pencilButton) pencilButton.remove();

      if (map) {
        map.remove();
        marker.remove();
      }
    });
  });

  createEffect(() => {
    props.theme();
    props.saleType();
    props.itemType();
    props.itemSort();
    props.rentPriceRange();
    props.buyPriceRange();
    untrack(setPriceRange);
    untrack(removeMarkers);
    untrack(() => handleSearch(false));
    untrack(() => setIsMapLoaded(false));
  });

  createEffect(() => {
    props.selectedCountry();
    props.selectedState();
    props.selectedCity();
    if (
      props.selectedCountry() ||
      props.selectedState() ||
      props.selectedCity()
    ) {
      untrack(() => handleSearch(true));
    }
  });

  createEffect(() => {
    if (isMapLoaded() && markers()) loadMarkers();
  });

  createEffect(() => {
    marker.remove();
    if (props.highlightedItemLngLat()) {
      marker.setLngLat({
        lng: props.highlightedItemLngLat()[0],
        lat: props.highlightedItemLngLat()[1],
      });
      marker.addTo(map);
    } else {
      if (props.selectedItem()) {
        marker.setLngLat({
          lng: props.selectedItem().lng,
          lat: props.selectedItem().lat,
        });
        marker.addTo(map);
      }
    }
  });

  onMount(() => marker.remove());

  return (
    <div class={`map-parent ${props.isPanelOpen() ? "list-is-open" : ""}`}>
      <div ref={drawParent} class="draw-parent">
        <button
          ref={newPencilButton}
          class="pencil-button"
          aria-label="Pencil"
          onMouseDown={clickPencil}
        >
          <IconPencil />
        </button>
        <button
          ref={trashButton}
          class="trash-button"
          aria-label="Trash"
          onMouseDown={clickTrash}
        >
          <IconTrash />
        </button>
      </div>
      <div ref={mapContainer} class={`map maplibregl-map`}></div>
    </div>
  );
}
