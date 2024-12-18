import { themes } from "~/utils/store";

const getDrawStyle = (theme: string) => [
  // ACTIVE (being drawn)
  // line stroke
  {
    id: "gl-draw-line",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": theme === themes.dark ? "#c7cad1" : "#636469",
      "line-dasharray": [0.2, 2],
      "line-width": 2,
    },
  },
  // polygon fill
  {
    id: "gl-draw-polygon-fill",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
    paint: {
      "fill-color": theme === themes.dark ? "#c7cad1" : "#636469",
      "fill-outline-color": theme === themes.dark ? "#c7cad1" : "#636469",
      "fill-opacity": 0.1,
    },
  },
  // polygon mid points
  {
    id: "gl-draw-polygon-midpoint",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
    paint: {
      "circle-radius": 3,
      "circle-color": "#fbb03b",
    },
  },
  // polygon outline stroke
  // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
  {
    id: "gl-draw-polygon-stroke-active",
    type: "line",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": theme === themes.dark ? "#c7cad1" : "#636469",
      "line-dasharray": [0.2, 2],
      "line-width": 2,
    },
  },
  // vertex point halos
  {
    id: "gl-draw-polygon-and-line-vertex-halo-active",
    type: "circle",
    filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
    paint: {
      "circle-radius": 5,
      "circle-color": "#FFF",
    },
  },
  // vertex points
  {
    id: "gl-draw-polygon-and-line-vertex-active",
    type: "circle",
    filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
    paint: {
      "circle-radius": 3,
      "circle-color": theme === themes.dark ? "#c7cad1" : "#636469",
    },
  },

  // INACTIVE
  // line stroke
  {
    id: "gl-draw-line-inactive",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"], ["==", "active", "false"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": theme === themes.dark ? "#c7cad1" : "#636469",
      "line-width": 3,
    },
  },
  // polygon fill
  {
    id: "gl-draw-polygon-fill-inactive",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]],
    paint: {
      "fill-color": theme === themes.dark ? "#c7cad1" : "#636469",
      "fill-outline-color": theme === themes.dark ? "#c7cad1" : "#636469",
      "fill-opacity": 0.1,
    },
  },
  // polygon outline
  {
    id: "gl-draw-polygon-stroke-inactive",
    type: "line",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": theme === themes.dark ? "#c7cad1" : "#636469",
      "line-width": 7,
    },
  },
];

export { getDrawStyle };
