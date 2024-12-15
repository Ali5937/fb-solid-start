import { createSignal } from "solid-js";
import { GetCurrentCurrency, getPriceRange } from "./setCurrency";
import { Currency } from "./interfaces";

export const delimiter = ",";

const baseRentMax = 5000;
const baseBuyMax = 1000000;
const maxValues = getPriceRange(baseRentMax, baseBuyMax);
export const rentMax = baseRentMax + 2; // + 2 needed because error on slider
export const buyMax = baseBuyMax + 2;

export const [saleType, setSaleType] = createSignal<string>("rent"); // rent, buy
export const [itemType, setItemType] = createSignal<string>("apartment"); // apartment, house, shared, land

export const [rentPriceRange, setRentPriceRange] = createSignal<
  [number, number]
>(maxValues.rentPrice);
export const [buyPriceRange, setBuyPriceRange] = createSignal<[number, number]>(
  maxValues.buyPrice
);
export const [currencyData, setCurrencyData] = createSignal<any>();

export const [currentCurrency, setCurrentCurrency] =
  createSignal<Currency | null>(GetCurrentCurrency().currentCurrency);
