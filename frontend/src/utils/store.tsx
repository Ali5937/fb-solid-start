import { createSignal } from "solid-js";
import { GetCurrentCurrency, getPriceRange } from "./setCurrency";
import { Currency } from "./interfaces";
import Cookies from "js-cookie";

export const delimiter = ",";
export const baseUrl = "http://localhost:5000/api";

export const themes = { light: "light-theme", dark: "dark-theme" };
let oldThemeCookie =
  Cookies.get("theme") === themes.light ? themes.light : themes.dark;
export const [theme, setTheme] = createSignal<string>(oldThemeCookie);

export const saleObj = { rent: "rent", buy: "buy" };
export const itemObj = {
  apartment: "apartment",
  house: "house",
  shared: "shared",
  land: "land",
};
export const [saleType, setSaleType] = createSignal<string>(saleObj.rent); // rent, buy
export const [itemType, setItemType] = createSignal<string>(itemObj.apartment); // apartment, house, shared, land

const baseRentMax = 5000;
const baseBuyMax = 1000000;
const maxValues = getPriceRange(baseRentMax, baseBuyMax);
export const rentMax = baseRentMax + 2; // + 2 needed because error on slider
export const buyMax = baseBuyMax + 2;
export const [rentPriceRange, setRentPriceRange] = createSignal<
  [number, number]
>(maxValues.rentPrice);
export const [buyPriceRange, setBuyPriceRange] = createSignal<[number, number]>(
  maxValues.buyPrice
);

export const [lowestPrice, setLowestPrice] = createSignal<number>(0);
export const [highestPrice, setHighestPrice] = createSignal<number>(1);

export const [currencyData, setCurrencyData] = createSignal<any>();
export const [currentCurrency, setCurrentCurrency] =
  createSignal<Currency | null>(GetCurrentCurrency().currentCurrency);

export const [userId, setUserId] = createSignal<string>();

export const defaultCountry = "All Countries";
export const defaultState = "All States";
export const selectCountry = "Select Country";
export const selectState = "Select State";

export const [countries, setCountries] = createSignal<string[]>([""]);
export const [states, setStates] = createSignal<string[]>([""]);
export const [selectedCountry, setSelectedCountry] = createSignal<string>("");
export const [selectedState, setSelectedState] = createSignal<string>("");
export const [selectedCity, setSelectedCity] = createSignal<string>("");
export const [inputValue, setInputValue] = createSignal("");

export const [moveMapCoordinates, setMoveMapCoordinates] = createSignal<{
  lng1: number;
  lat1: number;
  lng2: number;
  lat2: number;
}>();
