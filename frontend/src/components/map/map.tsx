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
import { SearchItems } from "~/utils/SearchItems";
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
  let oldCoordinates: [number, number] = [0, 0];
  let coordinates: [number, number] = [0, 0];
  let isPopupShown = false;
  let mapMarkerColor = ["#FF3333", "#2624B3"];
  const [isMapLoaded, setIsMapLoaded] = createSignal(false);

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
    mapSearch();
    checkIfSelectedItemIsVisibleOnMap();
    if (draw) draw.changeMode("simple_select");
  }

  function loadMarkers() {
    const markerCount = props.markers().data.features.length;
    props.markers().data.features.reverse();
    removeMarkers();
    map.addSource("marker-data", {
      type: "geojson",
      data: props.markers().data,
    });
    map.addLayer({
      id: "markers",
      type: "circle",
      source: "marker-data",
      paint: {
        "circle-radius": 10,
        "circle-color":
          markerCount > 1 && props.highestPrice() > props.lowestPrice()
            ? [
                "interpolate",
                ["linear"],
                ["get", "euroPrice"],
                props.lowestPrice(),
                mapMarkerColor[0],
                props.highestPrice(),
                mapMarkerColor[1],
              ]
            : mapMarkerColor[0],
        "circle-stroke-width": 1,
        "circle-stroke-color":
          props.theme() === "dark-theme" ? "white" : "black",
      },
    });
  }

  function removeMarkers() {
    if (map?.getLayer("markers")) map?.removeLayer("markers");
    if (map?.getSource("marker-data")) map?.removeSource("marker-data");
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

  async function mapSearch() {
    const priceRange =
      props.saleType() === "rent"
        ? props.rentPriceRange()
        : props.buyPriceRange();
    const bounds = map.getBounds();
    const resultItems = await SearchItems(
      false,
      map,
      draw,
      bounds,
      props.saleType(),
      props.itemType(),
      props.baseUrl,
      priceRange,
      props.itemSort(),
      props.selectedCountry(),
      props.selectedState(),
      props.selectedCity()
    );

    if (resultItems?.propertyItems) {
      props.setLowestPrice(resultItems?.lowestPrice);
      props.setHighestPrice(resultItems?.highestPrice);
      props.setMarkers(resultItems?.markers);
      props.setPropertyItems(resultItems?.propertyItems);
      checkIfSelectedItemIsVisibleOnMap();
    } else {
      if (draw.getAll().features.length > 0) {
        clickTrash();
        mapSearch();
      }
    }
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

      mapSearch();
    });

    map.on("draw.create", async function () {
      mapSearch();
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
    untrack(removeMarkers);
    untrack(mapSearch);
  });

  createEffect(() => {
    if (isMapLoaded() && props.markers()) loadMarkers();
  });

  createEffect(() => {
    if (props.moveMapCoordinates())
      untrack(() => {
        const m = props.moveMapCoordinates();
        map.fitBounds(
          [
            [m.lng1, m.lat1],
            [m.lng2, m.lat2],
          ],
          { padding: { top: 40, bottom: 100, left: 40, right: 40 } }
        );
      });
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
