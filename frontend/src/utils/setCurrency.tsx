import Cookies from "js-cookie";
import { delimiter } from "./store";
import { Currency } from "./interfaces";

export function getPriceRange(rentMax: number, buyMax: number) {
  let oldRentPrice: [number, number] = [0, rentMax];
  let oldBuyPrice: [number, number] = [0, buyMax];

  const rentPriceRangeCookie = Cookies.get("rentPriceRange")?.split(delimiter);
  if (
    rentPriceRangeCookie &&
    rentPriceRangeCookie[0] &&
    rentPriceRangeCookie[1]
  ) {
    oldRentPrice = [
      Number(rentPriceRangeCookie[0]) || oldRentPrice[0],
      Number(rentPriceRangeCookie[1]) || oldRentPrice[1],
    ];
  }
  const buyPriceRangeCookie = Cookies.get("buyPriceRange")?.split(delimiter);
  if (buyPriceRangeCookie && buyPriceRangeCookie[0] && buyPriceRangeCookie[1])
    oldBuyPrice = [
      Number(buyPriceRangeCookie[0]) || oldBuyPrice[0],
      Number(buyPriceRangeCookie[1]) || oldBuyPrice[1],
    ];

  return { rentPrice: oldRentPrice, buyPrice: oldBuyPrice };
}

export function GetCurrentCurrency() {
  let currentC = Cookies.get("currentCurrency");
  let splitCurrentCurrency;
  let finalCurrentCurrency: Currency | null;

  if (currentC && currentC != "null") {
    splitCurrentCurrency = currentC.split(delimiter);

    finalCurrentCurrency = {
      code: splitCurrentCurrency[0],
      name: splitCurrentCurrency[1],
      symbol: splitCurrentCurrency[splitCurrentCurrency.length - 2],
      exchangeRate: Number(
        splitCurrentCurrency[splitCurrentCurrency.length - 1]
      ),
    };
  } else {
    finalCurrentCurrency = {
      code: "EUR",
      name: "Euro",
      symbol: "€",
      exchangeRate: 1,
    };
  }
  return { currentCurrency: finalCurrentCurrency };
}
