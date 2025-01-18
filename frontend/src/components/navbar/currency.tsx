import { Show, Suspense } from "solid-js";
import AllCurrencies from "./allCurrencies";
import {
  currencyData,
  currentCurrency,
  setCurrentCurrency,
} from "~/utils/store";

export default function Currency(props: any) {
  return (
    <div
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
    >
      <div class="currency-button-parent">
        <Show when={!props.isAddItem}>
          <button
            class={`currency-button ${!currentCurrency() ? "highlighted" : ""}`}
            onMouseDown={() => {
              setCurrentCurrency(null);
            }}
          >
            <sup>$</sup>⁄<sub>€</sub>
          </button>
        </Show>
        <button
          class={`currency-button ${
            currentCurrency()?.code === "USD" ? "highlighted" : ""
          }`}
          onMouseDown={() => {
            setCurrentCurrency(currencyData().USD);
          }}
        >
          $
          <Show when={currencyData()}>
            <div class="currency-code">{currencyData().USD[0]}</div>
          </Show>
        </button>
        <button
          class={`currency-button ${
            currentCurrency()?.code === "EUR" ? "highlighted" : ""
          }`}
          onMouseDown={() => {
            setCurrentCurrency(currencyData().EUR);
          }}
        >
          €
          <Show when={currencyData()}>
            <div class="currency-code">{currencyData().EUR[0]}</div>
          </Show>
        </button>
        <button
          class={`currency-button ${
            currentCurrency()?.code === "GBP" ? "highlighted" : ""
          }`}
          onMouseDown={() => {
            setCurrentCurrency(currencyData().GBP);
          }}
        >
          £
          <Show when={currencyData()}>
            <div class="currency-code">{currencyData().GBP[0]}</div>
          </Show>
        </button>
      </div>
      <div class="separation"></div>
      <Suspense>
        <Show when={currencyData()}>
          <AllCurrencies currencyText={"Other Currencies"} />
        </Show>
      </Suspense>
    </div>
  );
}
